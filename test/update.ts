import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension, Extend, StatementBuilder } from '../src/builder/util';

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

const b = new Builder<MySchema, MyExtension>(new Functions<MySchema, {}, MyExtension>());

test(
  'basic',
  isParamsSql,
  b.update('employee').set({
    id: 5,
    name: 'Charlotte',
    salary: 5000,
    department_id: 55,
  }),
  'UPDATE "employee" SET "id" = $1, "name" = $2, "salary" = $3, "department_id" = $4',
  [5, 'Charlotte', 5000, 55],
);

test('shorthand', isParamsSql, b.update('employee').set('name', 'Charlotte'), 'UPDATE "employee" SET "name" = $1', [
  'Charlotte',
]);

test(
  'no params',
  isSql,
  b.update('employee').set({
    id: 5,
    name: 'Charlotte',
    salary: 5000,
    department_id: 55,
  }),
  `UPDATE "employee" SET "id" = 5, "name" = 'Charlotte', "salary" = 5000, "department_id" = 55`,
);

test(
  'with function',
  isSql,
  b.update('employee')(b =>
    b.set({
      salary: b.fn.add(b.col('salary'), b.lit(500)),
    }),
  ),
  `UPDATE "employee" SET "salary" = "salary" + 500`,
);
