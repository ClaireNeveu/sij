'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var ava_1 = require('ava');
var builder_1 = require('../src/builder');
var functions_1 = require('../src/builder/functions');
var _util_1 = require('./_util');
var b = new builder_1.Builder(new functions_1.Functions());
(0, ava_1.default)(
  'simple createTable',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'multiple statements',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable null default',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable on commit',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable local temp',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable local temp 2',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable global temp',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable not null column',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable not null column 2',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable unique column',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable unique column 2',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable unique column 3',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable named constraint',
  _util_1.isSqls,
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
(0, ava_1.default)(
  'createTable deferrable constraint',
  _util_1.isSqls,
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
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT CONSTRAINT "foo" UNIQUE DEFERRABLE)'],
);
(0, ava_1.default)(
  'createTable deferrable constraint 2',
  _util_1.isSqls,
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
    'CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT CONSTRAINT "foo" UNIQUE DEFERRABLE INITIALLY DEFERRED)',
  ],
);
(0, ava_1.default)(
  'createTable column collation',
  _util_1.isSqls,
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
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT UNIQUE COLLATE "fr_FR)'],
);
