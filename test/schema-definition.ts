import test, { Macro } from 'ava';

import { Builder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import {
  NoBuilderExtension,
} from '../src/builder/util';

import { isSqls, isParamsSql } from './_util';

type MySchema = {};

const b = new Builder<MySchema, NoBuilderExtension>(new Functions<MySchema, {}, NoBuilderExtension>());



test(
  'createTable',
  isSqls,
  b.schema.createTable('employees',
  {
    columns: {
        id: {
            type: b.type.bigInt,
            constraints: ['primary key'],
        },
        name: {
            type: b.type.text,
        },
        age: {
            type: b.type.smallInt
        }
    }
  }),
  ['CREATE TABLE "employees" ("id" BIGINT PRIMARY KEY, "name" TEXT, "age" SMALLINT)'],
);
