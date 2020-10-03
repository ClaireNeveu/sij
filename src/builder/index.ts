import { Expr, Ident, CompoundIdentifier } from '../ast/expr';
import { DataType } from '../ast/data-type';
import { Query, Select, JoinedTable, AnonymousSelection } from '../ast/query';
import { Literal } from '../ast/literal';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { TypedAst } from './functions';

const copy = <T extends {}>(obj: T, vals: Partial<T>): T => ({ ...obj, ...vals });

class Builder<Schema, Ext extends Extension = NoExtension> {
    from<Table extends (keyof Schema & string)>(table: Table) {
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
        return new QueryBuilder<Schema, Schema[Table], {}, Ext>(query);
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


class QueryBuilder<Schema, Table, Return, Ext extends Extension = NoExtension> {
    constructor(readonly _query: Query) {}

    // TODO support template literal types when typescript 4.1 lands
    select<
        Id extends (keyof Table & string),
        T extends (keyof Schema & string),
        Comp extends ColumnOf<Schema, T>,
        Exp extends TypedAst<Schema, any, Expr<Ext>>,
        Col extends Id | Comp | Exp,
    >(
        ...cols: Array<Col>
    ) {
        const selections = cols.map(c => {
            if (typeof c === 'object') {
                return AnonymousSelection(c as Expr<Ext>);
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
            return new QueryBuilder<Schema, Table, NewReturn, Ext>(copy(this._query, {
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
        
        return new QueryBuilder<Schema, Table, NewReturn, Ext>(copy(this._query, {
            unions: [
                ...this._query.unions.slice(0, numUnions - 1),
                newUnion
            ]
        }));
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

b.from('employee').select('department.budget', 'employee.id').select(ascii<MySchema, NoExtension>('name'))

const foo: { name: string } = b.from('employee').select('name').testingGet();

type TestTuple = [number, string]

const bar: string = null as unknown as TestTuple[0]

const ssss: { name: string, id: number } = b.from('employee').select('employee.name', 'employee.id').testingGet()
  
export {
    Builder
};
