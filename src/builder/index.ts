import CallableInstance_ from 'callable-instance';
const CallableInstance: any = CallableInstance_;

import { Expr, Ident, CompoundIdentifier } from '../ast/expr';
import { DataType } from '../ast/data-type';
import { Query, Select, JoinedTable, AnonymousSelection, AliasedSelection } from '../ast/query';
import { Literal } from '../ast/literal';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { TypedAst, Functions } from './functions';

const copy = <T extends {}>(obj: T, vals: Partial<T>): T => ({ ...obj, ...vals });


export type TypedAlias<Schema, Return, Col extends string, Ext extends Extension> =
    AliasedSelection<Ext> & { __schemaType: Schema, __returnType: Return };

class Builder<Schema, Ext extends Extension = NoExtension> {
      
    constructor() {}

    from<Table extends ((keyof Schema) & string)>(table: Table) {
        const select = Select({
            selections: [],
            from: JoinedTable({ name: Ident(table), joins: [] }),
            where: null,
            groupBy: [],
            having: null,
            extensions: null
        });
        const query = Query({
            commonTableExprs: [],
            selection: select,
            unions: [],
            ordering: [],
            limit: null,
            offset: null,
            extensions: null,
        });
        return new QueryBuilder<Schema, Schema[Table], Table, {}, Ext>(query, new Functions());
    }

    /**
     * Aliases an expression for use in a select.
     */
    as<Col extends string, R>(name: Col, expr: TypedAst<Schema, R, Expr<Ext>>) {
        return AliasedSelection({
            selection: expr,
            alias: Ident(name),
        }) as TypedAlias<Schema, R, Col, Ext>;
    }

    /**
     * Allows you to pass a raw bit of AST into the query.
     * You must provide the type of this expression.
     */
    ast<Return>(e: Expr<Ext>): TypedAst<Schema, Return, Expr<Ext>>{
        return e as TypedAst<Schema, Return, Expr<Ext>>
    }
}

type ColumnFinal<P> =
    P extends `${infer Key}.${infer Rest}` ? Rest : never;

type ColumnInit<P> =
    P extends `${infer Key}.${infer Rest}` ? Key : never;

export type StringKeys<T> = (keyof T) extends string ? keyof T : never;
export type QualifiedIds<Schema, Tn extends ((keyof Schema) & string)> = ({ [K in Tn]: `${K}.${StringKeys<Schema[K]>}` })[Tn];
// Need to carry this out or the constraint is lost in the .d.ts files
export type ValuesOf<Schema, Table, Tn extends ((keyof Schema) & string), Ext extends Extension, Id, C, K extends [any, any]> =
    C extends Id ? Table[K[0]]
    : C extends QualifiedIds<Schema, Tn> ? Schema[K[1]][K[0]]
    : C extends TypedAlias<Schema, any, any, Ext> ? K[1]
    : never;

class QueryBuilder<Schema, Table, Tn extends ((keyof Schema) & string), Return, Ext extends Extension = NoExtension> extends CallableInstance {
    
    constructor(readonly _query: Query, readonly fn: Functions<Schema, Table, Tn, Ext>) {
        super('apply');
    }


    apply<T>(fn: (arg: QueryBuilder<Schema, Table, Tn, Return, Ext>) => T): T {
        return fn(this);
    }

    selectAs<
        Id extends ((keyof Table) & string),
        Comp extends ({ [K in Tn]: `${K}.${StringKeys<Schema[K]>}` })[Tn],
        Exp extends TypedAst<Schema, any, Expr<Ext>>,
        Col extends Id | Comp | Exp,
    >(
        alias: string, col: Col
    ) {
        const selection = (() => {
            if (typeof col === 'object') {
                return AliasedSelection({
                    selection: col as unknown as Expr<Ext>,
                    alias: Ident(alias),
                }) as TypedAlias<Schema, any, any, Ext>;
            }
            return col;
        })();
        return this.select(selection as any);
    }
        

    select<
        Id extends ((keyof Table) & string),
        Comp extends ({ [K in Tn]: `${K}.${StringKeys<Schema[K]>}` })[Tn],
        Exp extends TypedAlias<Schema, any, any, Ext>,
        Col extends Id | Comp | Exp,
    >(
        ...cols: Array<Col>
    ) {
        const selections = cols.map(c => {
            if (typeof c === 'object') {
                return c as AliasedSelection<Ext>;
            }
            const idParts = (c as string).split('.');
            if (idParts.length === 1) {
                return AnonymousSelection(Ident(idParts[0] as string));
            } else {
                return AnonymousSelection(CompoundIdentifier(idParts.map(Ident)));
            }
        });
        type KeysOf<C> =
            C extends Id ? [C, any]
            : C extends Comp ? [ColumnFinal<C>, ColumnInit<C>]
            : C extends  TypedAlias<Schema, infer R, infer C, Ext> ? [C, R]
            : never;
        
        type ValuesOf1<C, K extends [any, any]> = ValuesOf<Schema, Table, Tn, Ext, Id, C, K>;

        type NewReturn = { [K in KeysOf<Col> as K[0]]: ValuesOf1<Col, K> } & Return;
        // Pick up any new aliases
        type NewTable = { [K in KeysOf<Col> as K[0]]: ValuesOf1<Col, K> } & Table;
        if (this._query.unions.length === 0) {
            return new QueryBuilder<Schema, NewTable, Tn, NewReturn, Ext>(copy(this._query, {
                selection: copy(this._query.selection, {
                    selections: [
                        ...this._query.selection.selections,
                        ...selections
                    ]
                })
            }), this.fn);
        }
        const numUnions = this._query.unions.length;
        const currentUnion = this._query.unions[numUnions - 1];

        const newUnion = copy(currentUnion, {
            select: copy(currentUnion.select, {
                selections: [
                    ...currentUnion.select.selections,
                    ...selections
                ]
            })
        })
        
        return new QueryBuilder<Schema, NewTable, Tn, NewReturn, Ext>(copy(this._query, {
            unions: [
                ...this._query.unions.slice(0, numUnions - 1),
                newUnion
            ]
        }), this.fn);
    }

    fakeJoin<T2 extends keyof Schema & string>() {
        return new QueryBuilder<Schema, Table & Schema[T2], Tn | T2, Return, Ext>(this._query, this.fn);
    }

    /** Method used in the tsd tests */
    __testingGet(): Return {
        throw new Error('Do not call this method, it only exists for testing');
    }
}
// Merges with above class to provide calling
interface QueryBuilder<Schema, Table, Tn extends ((keyof Schema) & string), Return, Ext extends Extension = NoExtension> {
    <T>(fn: (arg: QueryBuilder<Schema, Table, Tn, Return, Ext>) => T): T
}

type MySchema = {
    employee: {
        id: number,
        name: string,
    },
    department: {
        id: number,
        budget: number,
    },
};


const b = new Builder<MySchema, NoExtension>();

/*
const ggg: { name: string, id: number, asc: string } = b.from('employee')
    .select('employee.name', 'employee.id')
    .select(b.as('asc', ascii<MySchema, NoExtension>('name'))).__testingGet()
*/
b.from('employee').fakeJoin<'department'>().select('department.budget', 'employee.id')

//const foo: { name: string } = b.from('employee').select('name').__testingGet();

//const ssss: { name: string, id: number } = b.from('employee').select('employee.name', 'employee.id').__testingGet()

const bar = b.from('employee').select('id', 'name')(b => b.selectAs('name_length', b.fn.charLength('name')))

export {
    Builder
};
