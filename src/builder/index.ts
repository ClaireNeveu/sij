import { Expr, Ident, Lit } from '../ast/expr';
import {
    Query,
    Select,
    BasicTable,
    JoinedTable,
} from '../ast/query';
import {
    Insert,
    Update,
} from '../ast/statement';
import { DefaultValue } from '../ast/statement';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { TypedAst, Functions, ast } from './functions';
import {
    BuilderExtension,
    NoBuilderExtension,
    WithAlias,
    QualifiedTable,
    makeLit
} from './util';
import { QueryBuilder } from './query';
import { InsertBuilder } from './insert';
import { UpdateBuilder } from './update';

class Builder<Schema, Ext extends BuilderExtension> {
    fn: Functions<Schema, {}, Ext>
    dialect: string
    QueryBuilder: typeof QueryBuilder
    InsertBuilder: typeof InsertBuilder
    UpdateBuilder: typeof UpdateBuilder

    constructor(
        qb: typeof QueryBuilder = QueryBuilder,
        ib: typeof InsertBuilder = InsertBuilder,
        ub: typeof UpdateBuilder = UpdateBuilder,
    ) {
        this.fn = new Functions<Schema, {}, Ext>();
        this.dialect = 'SQL-92';
        this.QueryBuilder = qb;
        this.InsertBuilder = ib;
        this.UpdateBuilder = ub;
    }

    from<TableName extends ((keyof Schema) & string)>(
        table?: TableName
    ): QueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext> {
        const tableAst = (
            table === undefined
                ? null
                : JoinedTable<Ext>({ table: BasicTable(Ident(table)), joins: [] })
        );
        const select = Select<Ext>({
            selections: [],
            from: tableAst,
            where: null,
            groupBy: [],
            having: null,
            extensions: null
        });
        const query = Query<Ext>({
            commonTableExprs: [],
            selection: select,
            unions: [],
            ordering: [],
            limit: null,
            offset: null,
            extensions: null,
        });
        return new this.QueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext>(query, this.fn);
    }

    insertInto<TableName extends ((keyof Schema) & string)>(
        table: TableName
    ): InsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext> {
        const insert = Insert<Ext>({
            table: Ident(table),
            columns: [],
            values: null,
            extensions: null,
        })
        return new this.InsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(insert, this.fn);
    }

    update<TableName extends ((keyof Schema) & string)>(table: TableName) {
        const update = Update<Ext>({
            table: Ident(table),
            assignments: [],
            where: null,
            extensions: null,
        });
        return new this.UpdateBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(update, this.fn);
    }

    deleteFrom<Table extends ((keyof Schema) & string)>(table: Table) {
    }

    /**
     * Aliases an expression for use in a select.
     */
    as<Col extends string, T>(name: Col, val: T): WithAlias<Col, T> {
        return {
            alias: name,
            val,
        };
    }

    /**
     * Allows you to pass a raw bit of AST into the query.
     * You must provide the type of this expression.
     */
    ast<Return>(e: Expr<Ext>): TypedAst<Schema, Return, Expr<Ext>>{
        return {
            ast: e
        } as TypedAst<Schema, Return, Expr<Ext>>
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
}

export {
    Builder,
    QueryBuilder,
};
