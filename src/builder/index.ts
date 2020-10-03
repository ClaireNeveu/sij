import { Expr, Ident, CompoundIdentifier } from '../ast/expr';
import { DataType } from '../ast/data-type';
import { Query, Select, JoinedTable, AnonymousSelection, AliasedSelection } from '../ast/query';
import { Literal } from '../ast/literal';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { TypedAst } from './functions';

const copy = <T extends {}>(obj: T, vals: Partial<T>): T => ({ ...obj, ...vals });

class Builder<Schema, Ext extends Extension = NoExtension> {
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
        return new QueryBuilder<Schema, Schema[Table], Table, {}, Ext>(query);
    }

    as<Col extends string, R>(name: Col, expr: TypedAst<Schema, R, Expr<Ext>>) {
        return AliasedSelection({
            selection: expr,
            alias: Ident(name),
        }) as TypedAst<Schema, R, AliasedSelection<Ext>>;
    }

    /**
     * Allows you to pass a raw bit of AST into the query.
     * You must provide the type of this expression.
     */
    ast<Return>(e: Expr<Ext>): TypedAst<Schema, Return, Expr<Ext>>{
        return e as TypedAst<Schema, Return, Expr<Ext>>
    }
}

type ColumnValue<T, P extends ColumnOf<T>> =
  P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends ColumnOf<T[Key]>
      ? ColumnValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

type ColumnFinal<P> =
    P extends `${infer Key}.${infer Rest}` ? Rest : never;

type ColumnInit<P> =
    P extends `${infer Key}.${infer Rest}` ? Key : never;

type ColumnOf<T, Key extends keyof T = keyof T> =
  Key extends string
  ? T[Key] extends Record<string, any>
    ? | `${Key}.${keyof T[Key] & string}`
    : never
  : never;

type StringKeys<T> = (keyof T) extends string ? keyof T : never;

class QueryBuilder<Schema, Table, Tn extends ((keyof Schema) & string), Return, Ext extends Extension = NoExtension> {
    constructor(readonly _query: Query) {}

    // TODO selecting foo and bar.foo breaks type inference
    select<
        Id extends ((keyof Table) & string),
        Comp extends ({ [K in Tn]: `${K}.${StringKeys<Schema[K]>}` })[Tn],
        Exp extends TypedAst<Schema, any, AliasedSelection<Ext>>,
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
            : C extends Exp ? [any, any]
            : never;
        
        type ValuesOf<C, K extends [any, any]> =
            C extends Id ? Table[K[0]]
            : C extends Comp ? Schema[K[1]][K[0]]
            : C extends Exp ? any
            : never;

        type NewReturn = { [K in KeysOf<Col> as K[0]]: ValuesOf<Col, K> } & Return;
        if (this._query.unions.length === 0) {
            return new QueryBuilder<Schema, Table, Tn, NewReturn, Ext>(copy(this._query, {
                selection: copy(this._query.selection, {
                    selections: [
                        ...this._query.selection.selections,
                        ...selections
                    ]
                })
            }));
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
        
        return new QueryBuilder<Schema, Table, Tn, NewReturn, Ext>(copy(this._query, {
            unions: [
                ...this._query.unions.slice(0, numUnions - 1),
                newUnion
            ]
        }));
    }

    fakeJoin<T2 extends keyof Schema & string>() {
        return new QueryBuilder<Schema, Table & Schema[T2], Tn | T2, Return, Ext>(this._query);
    }
        
    testingGet(): Return {
        throw new Error('testing code');
    }
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

import { ascii } from './functions';

const b = new Builder<MySchema, NoExtension>();

b.from('employee').select('employee.name', 'employee.id').select(b.as('asc', ascii<MySchema, NoExtension>('name')))

b.from('employee').fakeJoin<'department'>().select('department.budget', 'employee.id')

const foo: { name: string } = b.from('employee').select('name').testingGet();

const ssss: { name: string, id: number } = b.from('employee').select('employee.name', 'employee.id').testingGet()
  
export {
    Builder
};
