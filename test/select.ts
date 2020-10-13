import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { Renderer } from '../src/render';

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

const r = new Renderer();
const b = new Builder<MySchema>();

const isSql: Macro<[QueryBuilder<any, any, any, any>, string]> = (t, query, out) => (
    t.is(r.renderQuery(query._query), out)
);


test('basic select works', isSql,
     b.from('employee').select('id', 'name'),
     'SELECT "id", "name" FROM "employee"',
    );

test('where shorthand works', isSql,
     b.from('employee').select('id', 'name').where({ id: 5 }),
     'SELECT "id", "name" FROM "employee" WHERE "id" = 5',
    );

test('multiple where shorthand works', isSql,
     b.from('employee').select('id', 'name').where({ id: 5, name: 'Charlie' }),
     `SELECT "id", "name" FROM "employee" WHERE "id" = 5 AND "name" = 'Charlie'`,
    );

test('multiple where clauses works', isSql,
     b.from('employee').select('id', 'name').where({ id: 5 }).where({ name: 'Charlie' }),
     `SELECT "id", "name" FROM "employee" WHERE "id" = 5 AND "name" = 'Charlie'`,
    );
