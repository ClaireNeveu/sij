import { expectError, expectNotType, expectType } from 'tsd';
import { Builder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import {
  BuilderExtension,
  NoBuilderExtension,
  Extend,
  ColumnOfType,
  TypedAst,
  TypeTag,
  StatementBuilder,
  DataTypeToJs,
} from '../src/builder/util';
import { Expr, FunctionApp } from '../src/ast/expr';
import { Expect, Equal, Debug, MergeInsertions, NotEqual } from './_util';
import { Char, Decimal, SqlBigInt } from '../src/ast/data-type';

type MySchema = {
  employee: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    budget: number;
  };
};

// Make sure tests work
expectType<Equal<number, MySchema['employee']['id']>>(true);
expectType<Equal<string, MySchema['employee']['id']>>(false);

const b = new Builder<MySchema, NoBuilderExtension>(new Functions<MySchema, {}, NoBuilderExtension>());

expectType<DataTypeToJs<Char>>('' as string);
expectNotType<DataTypeToJs<Char>>(0);

expectType<DataTypeToJs<SqlBigInt>>(BigInt(5));
expectNotType<DataTypeToJs<SqlBigInt>>(0);

const modifiedSchema1 = b.schema
  .createTable('new_table', {
    columns: {
      test: {
        type: SqlBigInt,
      },
    },
  })
  .schemaTag();

expectType<MergeInsertions<(typeof modifiedSchema1)['__tag']>['new_table']>({ test: BigInt(5) });
expectNotType<MergeInsertions<(typeof modifiedSchema1)['__tag']>['new_table']>({ test: 5 });
