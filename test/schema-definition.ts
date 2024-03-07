import test, { Macro } from 'ava';

import { Builder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension } from '../src/builder/util';

import { isSqls, isParamsSql } from './_util';

type MySchema = {};

const b = new Builder<MySchema, NoBuilderExtension>(new Functions<MySchema, {}, NoBuilderExtension>());

test(
  'simple createTable',
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
  'multiple statements',
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
        default: null,
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
