import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { NoBuilderExtension, Extend, StatementBuilder } from '../src/builder/util';
import { Renderer } from '../src/render';

type MySchema = {
    employee: {
        id: number,
        name: string,
        salary: number,
        department_id: number
    },
    department: {
        id: number,
        budget: number,
    },
};

const realNumber: { _tag: 'Real', val: string } = ({ _tag: 'Real', val: '5000' })

type MyExtension = Extend<{
    builder: {
        types: {
            numeric: number | bigint | { _tag: 'Real', val: string },
        }
    }
}>;

const r = new Renderer();
const b = new Builder<MySchema, MyExtension>();

const isSql: Macro<[StatementBuilder<any>, string]> = (t, builder, out) => (
    t.is(r.renderStatement(builder._statement), out)
);

const isParamsSql: Macro<[StatementBuilder<any>, string, Array<any>]> = (t, builder, str, par) => {
    const r = new Renderer({ paramsMode: true });
    const q = r.renderStatement(builder._statement);
    const { params } = r;
    t.is(q, str);
    t.deepEqual(params, par);
};

test('basic', isParamsSql,
     b.update('employee').set({
         id: 5,
         name: 'Charlotte',
         salary: 5000,
         department_id: 55
     }),
     'UPDATE "employee" SET "id" = $1, "name" = $2, "salary" = $3, "department_id" = $4',
     [5, 'Charlotte', 5000, 55]
    );

test('no params', isSql,
     b.update('employee').set({
         id: 5,
         name: 'Charlotte',
         salary: 5000,
         department_id: 55
     }),
     `UPDATE "employee" SET "id" = 5, "name" = 'Charlotte', "salary" = 5000, "department_id" = 55`,
    );
