import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension, Extend, StatementBuilder } from '../src/builder/util';
import { Renderer } from '../src/render';

import { isSql, isParamsSql } from './_util';

type MySchema = {
  employee: {
    id: number;
    name: string;
    salary: number;
    department_id: number;
  };
  department: {
    id: number;
    budget: number;
  };
};

const realNumber: { _tag: 'Real'; val: string } = { _tag: 'Real', val: '5000' };

type MyExtension = Extend<{
  builder: {
    types: {
      numeric: number | bigint | { _tag: 'Real'; val: string };
    };
  };
}>;

const r = new Renderer();
const b = new Builder<MySchema, MyExtension>(new Functions<MySchema, {}, MyExtension>());

test(
  'basic',
  isParamsSql,
  b.insertInto('employee').values({
    id: 5,
    name: 'Charlotte',
    salary: 5000,
    department_id: 55,
  }),
  'INSERT INTO "employee" ("id", "name", "salary", "department_id") VALUES ($1, $2, $3, $4)',
  [5, 'Charlotte', 5000, 55],
);

test(
  'explicit columns',
  isParamsSql,
  b.insertInto('employee').columns('id', 'name').values({
    id: 5,
    name: 'Charlotte',
    salary: 5000,
    department_id: 55,
  }),
  'INSERT INTO "employee" ("id", "name") VALUES ($1, $2)',
  [5, 'Charlotte'],
);

test(
  'no params',
  isSql,
  b.insertInto('employee').values({
    id: 5,
    name: 'Charlotte',
    salary: 5000,
    department_id: 55,
  }),
  `INSERT INTO "employee" ("id", "name", "salary", "department_id") VALUES (5, 'Charlotte', 5000, 55)`,
);

test(
  'from select',
  isSql,
  b.insertInto('employee').fromQuery(b.from('employee').select('*')),
  'INSERT INTO "employee" SELECT * FROM "employee"',
);

test(
  'with function',
  isParamsSql,
  b.insertInto('employee')(sql =>
    sql.values({
      id: 5,
      name: 'Charlotte',
      salary: sql.fn.add(sql.lit(5000), sql.lit(5)),
      department_id: 55,
    }),
  ),
  'INSERT INTO "employee" ("id", "name", "salary", "department_id") VALUES ($1, $2, ($3 + $4), $5)',
  [5, 'Charlotte', 5000, 5, 55],
);
