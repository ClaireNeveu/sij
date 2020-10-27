import CallableInstance from 'callable-instance';
import { lens } from 'lens.ts';
import type { Any } from 'ts-toolbelt';

import { Expr, Ident, CompoundIdentifier, Lit, Wildcard } from '../ast/expr';
import { DataType } from '../ast/data-type';
import {
    AliasedSelection,
    AnonymousSelection,
    CommonTableExpr,
    Join,
    JoinKind,
    JoinedTable,
    OrderingExpr,
    Query,
    Select,
    SetOp,
    TableAlias,
    BasicTable,
    DerivedTable,
} from '../ast/query';
import {
    Literal,
    NumLit,
    StringLit,
    BoolLit,
    NullLit,
} from '../ast/literal';
import { DefaultValue } from '../ast/statement';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { Functions } from './functions';
import {
    BuilderExtension,
    NoBuilderExtension,
    WithAlias,
    withAlias,
    AstToAlias,
    makeLit,
    StringKeys,
    SubBuilder,
    QualifyTable,
    QualifiedTable,
    UnQualifiedTable,
    TableOf,
    TypeTag,
    typeTag,
    TypedAst,
    ast,
} from './util';


type MakeJoinTable<Schema, J, Alias extends string> =
    J extends keyof Schema & string ? Schema[J] & QualifiedTable<Schema, J>
    : J extends WithAlias<infer A, QueryBuilder<any, any, infer T, any>> ? QualifyTable<A, T>
    : never;

/**
 * Builds a SELECT statement.
 */
class QueryBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> extends CallableInstance<Array<never>, unknown> {

    constructor(
        readonly _statement: Query<Ext>,
        readonly fn: Functions<Schema, Table, Ext>
    ) {
        super('apply');
    }

    apply<T>(fn: (arg: QueryBuilder<Schema, Table, Return, Ext>) => T): T {
        return fn(this);
    }

    /**
     * Allows you to insert a literal into the query.
     */
    lit<Return extends Ext['builder']['types']['numeric']
        | Ext['builder']['types']['string']
        | Ext['builder']['types']['boolean']
        | Ext['builder']['types']['date']
        | null>(
        l: Return
    ): TypedAst<Schema, Return, Expr<Ext>>{
        return {
            ast: makeLit(l as any)
        } as TypedAst<Schema, Return, Expr<Ext>>
    }

    /**
     * Select a single column or expression and alias it to `alias`.
     * `SELECT [col] AS [alias]`
     */
    selectAs<
        Alias extends string,
        Ret,
        Id extends ((keyof Table) & string),
        Col extends Id | TypedAst<Schema, Ret, Expr<Ext>>,
    >(
        alias: Alias, col: Col
    ): QueryBuilder<
        Schema,
        TableOf<Table, AstToAlias<Col, Alias>> & Table,
        UnQualifiedTable<TableOf<Table, AstToAlias<Col, Alias>>> & Return,
        Ext
    > {
        const selection: WithAlias<Alias, TypedAst<Schema, Ret, Expr<Ext>>> | Id = (() => {
            if (typeof col === 'object' && 'ast' in col ) {
                return withAlias(
                    alias,
                    (col as unknown as TypedAst<Schema, Ret, Expr<Ext>>)
                );
            }
            return col as Id;
        })();
        return this.select(selection) as any;
    }

    /**
     * Select columns or expressions. You can *either* select columns *or* expressions
     * but not both. If you need select both, split your selections across multiple
     * calls to `select`.
     */
    select<
        Alias extends string,
        ColType,
        Id extends ((keyof Table) & string),
        Col extends Id | '*' | WithAlias<Alias, TypedAst<Schema, ColType, Expr<Ext>>>,
    >(
        ...cols: Array<Col>
    ): QueryBuilder<Schema, TableOf<Table, Col> & Table, UnQualifiedTable<TableOf<Table, Col>> & Return, Ext> {
        // ^ modify Table to pick up any new aliases
        const selections = cols.map(c => {
            if (typeof c === 'object') {
                const wa = c as WithAlias<Alias, TypedAst<Schema, ColType, Expr<Ext>>>;
                return AliasedSelection<Ext>({
                    selection: wa.val.ast,
                    alias: Ident(wa.alias),
                })
            } else if (c === '*') {
                return AnonymousSelection<Ext>(Wildcard);
            }
            const idParts = (c as string).split('.');
            if (idParts.length === 1) {
                return AnonymousSelection<Ext>(Ident(idParts[0] as string));
            } else {
                return AnonymousSelection<Ext>(CompoundIdentifier(idParts.map(Ident)));
            }
        });
        if (this._statement.unions.length === 0) {
            return new QueryBuilder(
                lens<Query<Ext>>().selection.selections.set(s => [...s, ...selections])(this._statement),
                this.fn as any,
            );
        }
        const numUnions = this._statement.unions.length;
        const currentUnion = this._statement.unions[numUnions - 1];

        const newUnion = lens<SetOp<any>>().select.selections.set(
            s => [...s, ...selections]
        )(currentUnion);

        return new QueryBuilder(
            lens<Query<Ext>>().unions.set(u => [...u.slice(0, numUnions - 1), newUnion])(this._statement),
            this.fn as any,
        );
    }
    
    selectExpr<
        Alias extends string,
        ColType,
    >(
        ...cols: Array<WithAlias<Alias, TypedAst<Schema, ColType, Expr<Ext>>>>
    ) {
        const selections = cols.map(c => {
            const wa = c as WithAlias<Alias, TypedAst<Schema, ColType, Expr<Ext>>>;
            return AliasedSelection<Ext>({
                selection: wa.val.ast,
                alias: Ident(wa.alias),
            })
        });

        type NewReturn = UnQualifiedTable<{ [K in Alias]: ColType }> & Return;
        // Pick up any new aliases
        type NewTable = { [K in Alias]: ColType } & Table;
        if (this._statement.unions.length === 0) {
            return new QueryBuilder<Schema, NewTable, NewReturn, Ext>(
                lens<Query<Ext>>().selection.selections.set(s => [...s, ...selections])(this._statement),
                this.fn as any,
            );
        }
        const numUnions = this._statement.unions.length;
        const currentUnion = this._statement.unions[numUnions - 1];

        const newUnion = lens<SetOp<any>>().select.selections.set(
            s => [...s, ...selections]
        )(currentUnion);

        return new QueryBuilder<Schema, NewTable, NewReturn, Ext>(
            lens<Query<Ext>>().unions.set(u => [...u.slice(0, numUnions - 1), newUnion])(this._statement),
            this.fn as any,
        );
    }

    // TODO join on table-valued functions
    // Am I crazy enough to fully-type json_table?
    // TODO create ON shorthand so you can do:
    // `sql.from('my_table').leftJoin('other_table', { 'my_table.col': 'other_table.col' })`
    /**
     * `[kind] JOIN [table] ON [on]`
     *
     * @param on Expression to condition the join on. If using Typescript, this must be provided
     *        as a function from the builder to your ON expression so you have the extra
     *        columns from the join available on the builder.
     */
    join<
        TableName extends keyof Schema & string,
        Alias extends string,
        SubTable,
        JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>
    >(
        kind: JoinKind,
        table: JoinTable,
        on: SubBuilder<
                QueryBuilder<
                    Schema,
                    Table & MakeJoinTable<Schema, JoinTable, Alias>,
                    Return,
                    Ext
                >,
                TypedAst<Schema, any, Expr<Ext>>
            >,
    ): QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext> {
        const on_ = on instanceof Function ? on(this as any) : on;
        const newTable = (() => {
            if (typeof table === 'string') {
                return BasicTable(Ident(table));
            }
            const wa = table as WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>;
            return DerivedTable({
                alias: Ident(wa.alias),
                subQuery: wa.val._statement,
            });
        })();
        const newJoin = Join<Ext>({
            table: newTable,
            kind: kind,
            on: on_.ast,
        });
        return new QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext>(
            lens<Query<Ext>>().selection.from.joins.set(js => [...js, newJoin])(this._statement),
            this.fn as any,
        );
    }

    /**
     * `LEFT OUTER JOIN [table] ON [on]`
     */
    leftJoin<
        TableName extends keyof Schema & string,
        Alias extends string,
        SubTable,
        JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>
    >(
        table: JoinTable,
        on: SubBuilder<
                QueryBuilder<
                    Schema,
                    Table & MakeJoinTable<Schema, JoinTable, Alias>,
                    Return,
                    Ext
                >,
                TypedAst<Schema, any, Expr<Ext>>
            >,
    ): QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext> {
        return this.join('LEFT OUTER', table, on);
    }

    /**
     * `RIGHT OUTER JOIN [table] ON [on]`
     */
    rightJoin<
        TableName extends keyof Schema & string,
        Alias extends string,
        SubTable,
        JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>
    >(
        table: JoinTable,
        on: SubBuilder<
                QueryBuilder<
                    Schema,
                    Table & MakeJoinTable<Schema, JoinTable, Alias>,
                    Return,
                    Ext
                >,
                TypedAst<Schema, any, Expr<Ext>>
            >,
    ): QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext> {
        return this.join('RIGHT OUTER', table, on);
    }

    /**
     * `FULL OUTER JOIN [table] ON [on]`
     */
    fullOuterJoin<
        TableName extends keyof Schema & string,
        Alias extends string,
        SubTable,
        JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>
    >(
        table: JoinTable,
        on: SubBuilder<
                QueryBuilder<
                    Schema,
                    Table & MakeJoinTable<Schema, JoinTable, Alias>,
                    Return,
                    Ext
                >,
                TypedAst<Schema, any, Expr<Ext>>
            >,
    ): QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext> {
        return this.join('FULL OUTER', table, on);
    }

    /**
     * `INNER JOIN [table] ON [on]`
     */
    innerJoin<
        TableName extends keyof Schema & string,
        Alias extends string,
        SubTable,
        JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, Ext>>
    >(
        table: JoinTable,
        on: SubBuilder<
                QueryBuilder<
                    Schema,
                    Table & MakeJoinTable<Schema, JoinTable, Alias>,
                    Return,
                    Ext
                >,
                TypedAst<Schema, any, Expr<Ext>>
            >,
    ): QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, Ext> {
        return this.join('INNER', table, on);
    }

    with<Table2, TableName extends string>(
        alias: TableName,
        sub: QueryBuilder<Schema, Table2, Return, Ext>,
    ): QueryBuilder<Schema, Table & { [K in StringKeys<Table2> as `${TableName}.${K}`]: Table2[K] }, Return, Ext> {
        const tAlias = TableAlias({ name: Ident(alias), columns: [] });
        const newCte = CommonTableExpr({ alias: tAlias, query: sub._statement });
        return new QueryBuilder<Schema, Table & { [K in StringKeys<Table2> as `${TableName}.${K}`]: Table2[K] }, Return, Ext>(
            lens<Query<Ext>>().commonTableExprs.set(ctes => [...ctes, newCte])(this._statement),
            this.fn as any,
        );
    }

    orderBy<
        Id extends ((keyof Table) & string),
        Exp extends Expr<Ext>,
        Col extends Id | Exp,
    >(
        col: Col,
        opts?: { order?: 'ASC' | 'DESC', nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
    ) {
        const expr = (() => {
            if (typeof col === 'object') {
                return col as Expr<Ext>;
            }
            const idParts = (col as string).split('.');
            if (idParts.length === 1) {
                return Ident(idParts[0] as string);
            } else {
                return CompoundIdentifier(idParts.map(Ident));
            }
        })();
        const newOrder = OrderingExpr({
            expr,
            order: opts?.order ?? null,
            nullHandling: opts?.nullHandling ?? null,
        });
        return new QueryBuilder<Schema, Table, Return, Ext>(
            lens<Query<Ext>>().ordering.set(os => [...os, newOrder])(this._statement),
            this.fn as any,
        );
    }

    orderByAsc<
        Id extends ((keyof Table) & string),
        Exp extends Expr<Ext>,
        Col extends Id | Exp,
    >(
        col: Col,
        opts?: { nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
    ) {
        const subOpts = { ...(opts ?? {}), order: ('ASC' as 'ASC') }
        this.orderBy(col, subOpts);
    }

    orderByDesc<
        Id extends ((keyof Table) & string),
        Exp extends Expr<Ext>,
        Col extends Id | Exp,
    >(
        col: Col,
        opts?: { nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
    ) {
        const subOpts = { ...(opts ?? {}), order: ('DESC' as 'DESC') }
        this.orderBy(col, subOpts);
    }

    /**
     * `LIMIT [expr]`
     */
    limit(expr: Expr<Ext> | number) {
        const lim = typeof expr === 'number' ? Lit(NumLit(expr)) : expr
        return new QueryBuilder<Schema, Table, Return, Ext>(
            lens<Query<Ext>>().limit.set(() => lim)(this._statement),
            this.fn as any,
        );
    }

    /**
     * `OFFSET [expr]`
     */
    offset(expr: Expr<Ext> | number) {
        const off = typeof expr === 'number' ? Lit(NumLit(expr)) : expr
        return new QueryBuilder<Schema, Table, Return, Ext>(
            lens<Query<Ext>>().offset.set(() => off)(this._statement),
            this.fn as any,
        );
    }

    /**
     * `WHERE [expr]`
     * @param clause Either an expression that evaluates to a boolean or a
     *        shorthand equality object mapping columns to values.
     */
    where(clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<Ext>>) {
        const expr: Expr<Ext> = (() => {
            if (typeof clause === 'object' && !('ast' in clause)) {
                return Object.keys(clause).map(k => {
                    const val: any = ((clause as any)[k]) as any
                    return this.fn.eq((k as any), ast<Schema, any, Expr<Ext>>(makeLit(val)))
                }).reduce((acc, val) => this.fn.and(acc, val)).ast;
            }
            return clause.ast;
        })();
        const updateWhere = (old: Expr<Ext> | null): Expr<Ext> => {
            if (old === null) {
                return expr;
            }
            return this.fn.and(
                ast<Schema, boolean, Expr<Ext>>(old),
                ast<Schema, boolean, Expr<Ext>>(expr)
            ).ast;
        };
        return new QueryBuilder<Schema, Table, Return, Ext>(
            lens<Query<Ext>>().selection.where.set(e => updateWhere(e))(this._statement),
            this.fn as any,
        );
    }

    /**
     * Removes all type information from the builder allowing you to select whatever
     * you want and get back the any type. This should never be necessary as the SIJ
     * builder includes a complete typing of SQL but in situations where SIJ has a bug
     * you can continue using it while waiting for the upstream to be fixed.
     */
    unTyped(): QueryBuilder<any, any, any, Ext> {
        return this;
    }

    returnTag(): TypeTag<Return> {
        return typeTag<Return>();
    }
}
// Merges with above class to provide calling as a function
interface QueryBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> {
    <T>(fn: (arg: QueryBuilder<Schema, Table, Return, Ext>) => T): T
}

export {
    QueryBuilder,
};
