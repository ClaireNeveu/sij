import test, { Macro } from 'ava';

import { Builder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension } from '../src/builder/util';

import { isSqls, isParamsSql } from './_util';

type MySchema = {};

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

const b = new Builder<MySchema, NoBuilderExtension>(new Functions<MySchema, {}, NoBuilderExtension>());
const be = new Builder<MyExistingSchema, NoBuilderExtension>(new Functions<MyExistingSchema, {}, NoBuilderExtension>());

test(
  'multiple schema statements',
  isSqls,
  b.schema
    .createTable('employees', {
      columns: {
        id: {
          type: b.type.bigInt,
          constraints: ['primary key'],
        },
        name: {
          type: b.type.text,
        },
        age: {
          type: b.type.smallInt,
        },
      },
    })
    .createTable('departments', {
      columns: {
        id: {
          type: b.type.bigInt,
          constraints: ['primary key'],
        },
        name: {
          type: b.type.text,
        },
      },
    }),
  [
    'CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT, "age" SMALLINT)',
    'CREATE TABLE "departments" ("id" BIGINT PRIMARY KEY, "name" TEXT)',
  ],
);

test(
  'createTable simple',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
      },
      age: {
        type: b.type.smallInt,
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT, "age" SMALLINT)'],
);

test(
  'createTable in schema',
  isSqls,
  b.schema.createTable('finance.employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
      },
      age: {
        type: b.type.smallInt,
      },
    },
  }),
  ['CREATE TABLE "finance"."employees" ("id" BIGINT PRIMARY KEY, "name" TEXT, "age" SMALLINT)'],
);

test(
  'createTable check constraint',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
      },
    },
    constraints: [b.constraint.check(b.fn.gt('name', b.lit(5)))],
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT, CHECK "name" > 5)'],
);

test(
  'createTable null default',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: null,
      },
      age: {
        type: b.type.smallInt,
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "age" SMALLINT)'],
);

test(
  'createTable timestamp default',
  isSqls,
  b.schema.createTable('employee', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: null,
      },
      created: {
        type: b.type.timestamp,
        default: b.default.currentTimestamp(),
      },
    },
  }),
  [
    'CREATE TABLE "employee" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "created" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
  ],
);

test(
  'createTable on commit',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: b.default.null(),
      },
      age: {
        type: b.type.smallInt,
      },
    },
    onCommit: 'Preserve',
  }),
  [
    'CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "age" SMALLINT) ON COMMIT PRESERVE ROWS',
  ],
);

test(
  'createTable local temp',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: null,
      },
      age: {
        type: b.type.smallInt,
      },
    },
    local: true,
  }),
  ['CREATE LOCAL TEMPORARY TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "age" SMALLINT)'],
);

test(
  'createTable local temp 2',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: null,
      },
      age: {
        type: b.type.smallInt,
      },
    },
    local: true,
    temporary: true,
  }),
  ['CREATE LOCAL TEMPORARY TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "age" SMALLINT)'],
);

test(
  'createTable global temp',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: ['primary key'],
      },
      name: {
        type: b.type.text,
        default: null,
      },
      age: {
        type: b.type.smallInt,
      },
    },
    temporary: true,
  }),
  ['CREATE GLOBAL TEMPORARY TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT DEFAULT NULL, "age" SMALLINT)'],
);

test(
  'createTable not null column',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: ['not null'],
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT NOT NULL)'],
);

test(
  'createTable not null column 2',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.notNull(),
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT NOT NULL)'],
);

test(
  'createTable unique column',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: 'UNIQUE',
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT UNIQUE)'],
);

test(
  'createTable unique column 2',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique(),
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT UNIQUE)'],
);

test(
  'createTable unique column 3',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique({ primaryKey: true }),
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT PRIMARY KEY)'],
);

test(
  'createTable named constraint',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique({ name: 'foo' }),
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT CONSTRAINT "foo" UNIQUE)'],
);

test(
  'createTable deferrable constraint 1',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique({ name: 'foo', deferrable: true }),
      },
    },
  }),
  [
    'CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT CONSTRAINT "foo" UNIQUE INITIALLY IMMEDIATE DEFERRABLE)',
  ],
);

test(
  'createTable deferrable constraint 2',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique({ name: 'foo', deferrable: true, initiallyDeferred: true }),
      },
    },
  }),
  [
    'CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT CONSTRAINT "foo" UNIQUE INITIALLY DEFERRED DEFERRABLE)',
  ],
);

test(
  'createTable column collation',
  isSqls,
  b.schema.createTable('employees', {
    columns: {
      id: {
        type: b.type.bigInt,
        constraints: 'primary key',
      },
      name: {
        type: b.type.text,
        constraints: b.constraint.unique(),
        collation: 'fr_FR',
      },
    },
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT UNIQUE COLLATE "fr_FR")'],
);

test(
  'createView simple',
  isSqls,
  be.schema.createView('old_employees', {
    query: be.from('employee').select('*')(be => be.where(be.fn.gt('age', be.lit(50)))),
  }),
  ['CREATE VIEW "old_employees" AS SELECT * FROM "employee" WHERE "age" > 50'],
);

test(
  'createView in schema',
  isSqls,
  be.schema.createView('foo.old_employees', {
    query: be.from('employee').select('*')(be => be.where(be.fn.gt('age', be.lit(50)))),
  }),
  ['CREATE VIEW "foo"."old_employees" AS SELECT * FROM "employee" WHERE "age" > 50'],
);

test(
  'createView columns',
  isSqls,
  be.schema.createView('old_employees', {
    columns: ['id', 'bar'], // TODO see if there's some way to get this to type-check
    query: be.from('employee').select('*')(be => be.where(be.fn.gt('age', be.lit(50)))),
    withLocalCheckOption: false,
  }),
  ['CREATE VIEW "old_employees" ("id", "bar") AS SELECT * FROM "employee" WHERE "age" > 50'],
);

test(
  'createView cascaded check option',
  isSqls,
  be.schema.createView('old_employees', {
    columns: ['id', 'bar'], // TODO see if there's some way to get this to type-check
    query: be.from('employee').select('*')(be => be.where(be.fn.gt('age', be.lit(50)))),
    withCascadedCheckOption: true,
  }),
  ['CREATE VIEW "old_employees" ("id", "bar") AS SELECT * FROM "employee" WHERE "age" > 50 WITH CASCADED CHECK OPTION'],
);

test(
  'createView local check option',
  isSqls,
  be.schema.createView('old_employees', {
    columns: ['foo', 'bar'], // TODO see if there's some way to get this to type-check
    query: be.from('employee').select('*')(be => be.where(be.fn.gt('age', be.lit(50)))),
    withLocalCheckOption: true,
  }),
  ['CREATE VIEW "old_employees" ("foo", "bar") AS SELECT * FROM "employee" WHERE "age" > 50 WITH LOCAL CHECK OPTION'],
);

test(
  'grant simple',
  isSqls,
  be.schema.grant({
    privileges: ['select'],
    on: 'TABLE employee',
    to: ['emily'],
  }),
  ['GRANT SELECT ON TABLE "employee" TO "emily"'],
);

test(
  'grant with grant option',
  isSqls,
  be.schema.grant({
    privileges: ['select'],
    on: 'TABLE employee',
    to: ['emily'],
    withGrantOption: true,
  }),
  ['GRANT SELECT ON TABLE "employee" TO "emily" WITH GRANT OPTION'],
);

test(
  'grant public',
  isSqls,
  be.schema.grant({
    privileges: ['select'],
    on: 'TABLE employee',
    public: true,
  }),
  ['GRANT SELECT ON TABLE "employee" TO PUBLIC'],
);

test(
  'grant all privileges',
  isSqls,
  be.schema.grant({
    privileges: 'ALL',
    on: 'TABLE employee',
    to: ['emily'],
  }),
  ['GRANT ALL PRIVILEGES ON TABLE "employee" TO "emily"'],
);

test(
  'grant all privileges public',
  isSqls,
  be.schema.grant({
    privileges: 'ALL',
    on: 'TABLE employee',
    public: true,
  }),
  ['GRANT ALL PRIVILEGES ON TABLE "employee" TO PUBLIC'],
);

test(
  'create domain simple',
  isSqls,
  b.schema.createDomain('cat_breed', {
    type: b.type.smallInt,
  }),
  ['CREATE DOMAIN "cat_breed" AS SMALLINT'],
);

test(
  'create domain in schema',
  isSqls,
  b.schema.createDomain('fancy_feast.cat_breed', {
    type: b.type.smallInt,
  }),
  ['CREATE DOMAIN "fancy_feast"."cat_breed" AS SMALLINT'],
);

test(
  'create domain default null',
  isSqls,
  b.schema.createDomain('cat_breed', {
    type: b.type.smallInt,
    default: null,
  }),
  ['CREATE DOMAIN "cat_breed" AS SMALLINT DEFAULT NULL'],
);

test(
  'create domain default 5',
  isSqls,
  b.schema.createDomain('cat_breed', {
    type: b.type.smallInt,
    default: b.default(5),
  }),
  ['CREATE DOMAIN "cat_breed" AS SMALLINT DEFAULT 5'],
);

test(
  'create domain collation',
  isSqls,
  b.schema.createDomain('cat_breed', {
    type: b.type.varChar(32),
    default: b.default('tabby'),
    collate: 'fr_FR',
  }),
  ['CREATE DOMAIN "cat_breed" AS VARCHAR(32) DEFAULT \'tabby\' COLLATE "fr_FR"'],
);

test(
  'create domain constraint',
  isSqls,
  b.schema.createDomain('cat_breed', {
    type: b.type.varChar(32),
    default: b.default('tabby'),
    constraints: [b.constraint.check(b.fn.lt(b.value, b.lit(20)))],
    collate: 'fr_FR',
  }),
  ['CREATE DOMAIN "cat_breed" AS VARCHAR(32) DEFAULT \'tabby\' COLLATE "fr_FR" CHECK (VALUE < 20)'],
);

test(
  'create schema simple',
  isSqls,
  b.schema.createSchema('myschema'),
  ['CREATE SCHEMA "myschema"'],
);

test(
  'create schema authorization',
  isSqls,
  b.schema.createSchema('myschema', {
    authorization: 'emily'
  }),
  ['CREATE SCHEMA "myschema" AUTHORIZATION "emily"'],
);

test(
  'create schema character set',
  isSqls,
  b.schema.createSchema('myschema', {
    authorization: 'emily',
    characterSet: 'fr_FR',
  }),
  ['CREATE SCHEMA "myschema" AUTHORIZATION "emily" DEFAULT CHARACTER SET "fr_FR"'],
);

test(
  'create schema in catalog',
  isSqls,
  b.schema.createSchema('mycatalog.myschema', {
    authorization: 'emily'
  }),
  ['CREATE SCHEMA "mycatalog"."myschema" AUTHORIZATION "emily"'],
);
