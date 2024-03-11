import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import {
  BuilderExtension,
  NoBuilderExtension,
  Extend,
  ColumnOfType,
  TypedAst,
  StatementBuilder,
} from '../src/builder/util';
import { Expr, FunctionApp } from '../src/ast/expr';
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
  'finance.department': {
    id: number;
    secret_stash_location: string;
  }
};

const realNumber: { _tag: 'Real'; val: string } = { _tag: 'Real', val: '5000' };

class MyFunctions<Schema, Table, Ext extends BuilderExtension> extends Functions<Schema, Table, Ext> {
  charLength<String extends Ext['builder']['types']['string']>(
    value: ColumnOfType<String, Table> | TypedAst<Schema, String, Expr<Ext>>,
  ): TypedAst<Schema, number, FunctionApp<Ext>> {
    return this._function<String, number>('CHAR_LENGTH', [value]);
  }
}

type MyExtension = Extend<{
  builder: {
    types: {
      numeric: number | bigint | { _tag: 'Real'; val: string };
    };
  };
}>;

const r = new Renderer();
const b = new Builder<MySchema, MyExtension>(new MyFunctions<MySchema, {}, MyExtension>());

test('basic select works', isSql, b.from('employee').select('id', 'name'), 'SELECT "id", "name" FROM "employee"');

test('wildcard select works', isSql, b.from('employee').select('*'), 'SELECT * FROM "employee"');

test('select without table works', isSql, b.from().selectAs('my_val', b.lit(1)), 'SELECT 1 AS "my_val"');


test(
  'select from schema works', 
  isSql, 
  b.from('finance.department').select('id', 'secret_stash_location'), 
  'SELECT "id", "secret_stash_location" FROM "finance"."department"'
);

test(
  'select with custom literal works',
  isParamsSql,
  b.from().selectAs('my_val', b.lit(realNumber)),
  'SELECT $1 AS "my_val"',
  [realNumber],
);

test(
  'select with + works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.selectAs('new_salary', b.fn.add('salary', b.lit(5)))),
  'SELECT "id", "name", "salary" + 5 AS "new_salary" FROM "employee"',
);

test(
  'select with - works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.selectAs('new_salary', b.fn.subtract('salary', b.lit(5)))),
  'SELECT "id", "name", "salary" - 5 AS "new_salary" FROM "employee"',
);

test(
  'select with * (mult) works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.selectAs('new_salary', b.fn.multiply('salary', b.lit(5)))),
  'SELECT "id", "name", "salary" * 5 AS "new_salary" FROM "employee"',
);

test(
  'select with / works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.selectAs('new_salary', b.fn.divide('salary', b.lit(5)))),
  'SELECT "id", "name", "salary" / 5 AS "new_salary" FROM "employee"',
);

test(
  'select with % works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.selectAs('new_salary', b.fn.mod('salary', b.lit(5)))),
  'SELECT "id", "name", "salary" % 5 AS "new_salary" FROM "employee"',
);

test(
  'where with = works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.eq('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" = 5',
);

test(
  'where with <> works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.neq('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" <> 5',
);

test(
  'where with LIKE works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.like('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" LIKE 5',
);

test(
  'where with NOT LIKE works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.notLike('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" NOT LIKE 5',
);

test(
  'where with > works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.greaterThan('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" > 5',
);

test(
  'where with < works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.lessThan('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" < 5',
);

test(
  'where with >= works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.gte('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" >= 5',
);

test(
  'where with <= works',
  isSql,
  b.from('employee').select('id', 'name')(b => b.where(b.fn.lte('id', b.lit(5)))),
  'SELECT "id", "name" FROM "employee" WHERE "id" <= 5',
);

test(
  'where with or works',
  isSql,
  b.from('employee').select('id', 'name')(b =>
    b.where(b.fn.or(b.fn.lessThan('id', b.lit(5)), b.fn.greaterThan('id', b.lit(50)))),
  ),
  'SELECT "id", "name" FROM "employee" WHERE "id" < 5 OR "id" > 50',
);

test(
  'where with shorthand works',
  isSql,
  b.from('employee').select('id', 'name').where({
    id: 5,
    name: 'Charlie',
  }),
  `SELECT "id", "name" FROM "employee" WHERE "id" = 5 AND "name" = 'Charlie'`,
);

test(
  'where with params works',
  isParamsSql,
  b.from('employee').select('id', 'name')(b =>
    b.where(b.fn.or(b.fn.lessThan('id', b.lit(5)), b.fn.greaterThan('id', b.lit(50)))),
  ),
  'SELECT "id", "name" FROM "employee" WHERE "id" < $1 OR "id" > $2',
  [5, 50],
);

test(
  'where shorthand works',
  isSql,
  b.from('employee').select('id', 'name').where({ id: 5 }),
  'SELECT "id", "name" FROM "employee" WHERE "id" = 5',
);

test(
  'multiple where shorthand works',
  isSql,
  b.from('employee').select('id', 'name').where({ id: 5, name: 'Charlie' }),
  `SELECT "id", "name" FROM "employee" WHERE "id" = 5 AND "name" = 'Charlie'`,
);

test(
  'multiple where clauses works',
  isSql,
  b.from('employee').select('id', 'name').where({ id: 5 }).where({ name: 'Charlie' }),
  `SELECT "id", "name" FROM "employee" WHERE "id" = 5 AND "name" = 'Charlie'`,
);

test(
  'joining on regular table works',
  isSql,
  b
    .from('employee')
    .leftJoin('department', b => b.fn.eq('department.id', 'employee.department_id'))
    .select('name', 'department.budget'),
  `SELECT "name", "department"."budget" FROM "employee" LEFT OUTER JOIN "department" ON "department"."id" = "employee"."department_id"`,
);

test(
  'joining on derived table works',
  isSql,
  b
    .from('employee')
    .leftJoin(b.as('t1', b.from('department').select('id', 'budget')), b => b.fn.eq('t1.id', 'employee.department_id'))
    .select('name', 't1.budget'),
  `SELECT "name", "t1"."budget" FROM "employee" LEFT OUTER JOIN (SELECT "id", "budget" FROM "department") AS "t1" ON "t1"."id" = "employee"."department_id"`,
);
