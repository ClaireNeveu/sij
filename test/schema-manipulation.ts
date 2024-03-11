import test, { Macro } from 'ava';

import { Builder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension } from '../src/builder/util';

import { isSqls, isParamsSql } from './_util';

type MyExistingSchema = {
  employee: {
    id: number;
    name: string;
    salary: number;
    department_id: number;
    age: number;
  };
  department: {
    id: number;
    budget: number;
  };
};

const b = new Builder<MyExistingSchema, NoBuilderExtension>(new Functions<MyExistingSchema, {}, NoBuilderExtension>());

test('dropTable restrict', isSqls, b.schema.dropTable('employee', 'restrict'), ['DROP TABLE "employee" RESTRICT']);

test('dropTable cascade', isSqls, b.schema.dropTable('employee', 'CASCADE'), ['DROP TABLE "employee" CASCADE']);

test('dropView restrict', isSqls, b.schema.dropView('employee', 'restrict'), ['DROP VIEW "employee" RESTRICT']);

test('dropView cascade', isSqls, b.schema.dropView('employee', 'CASCADE'), ['DROP VIEW "employee" CASCADE']);

test(
  'revoke simple',
  isSqls,
  b.schema.revoke({
    privileges: ['select'],
    on: 'table employee',
    from: ['emily'],
    behavior: 'restrict',
  }),
  ['REVOKE SELECT ON TABLE "employee" FROM "emily" RESTRICT'],
);

test(
  'revoke all',
  isSqls,
  b.schema.revoke({
    privileges: 'all',
    on: 'table employee',
    from: ['emily'],
    behavior: 'restrict',
  }),
  ['REVOKE ALL PRIVILEGES ON TABLE "employee" FROM "emily" RESTRICT'],
);

test(
  'revoke public',
  isSqls,
  b.schema.revoke({
    privileges: 'all',
    on: 'collation french',
    public: true,
    behavior: 'cascade',
  }),
  ['REVOKE ALL PRIVILEGES ON COLLATION "french" FROM PUBLIC CASCADE'],
);

test(
  'drop domain cascade',
  isSqls,
  b.schema.dropDomain("cat_breed", 'cascade'),
  ['DROP DOMAIN "cat_breed" CASCADE'],
);

test(
  'drop domain restrict',
  isSqls,
  b.schema.dropDomain("cat_breed", 'RESTRICT'),
  ['DROP DOMAIN "cat_breed" RESTRICT'],
);

test(
  'alter table simple',
  isSqls,
  b.schema.alterTable('employee', b => b.dropColumn('name', 'restrict')),
  ['ALTER TABLE "employee" DROP COLUMN "name" RESTRICT'],
);