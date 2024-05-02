import {
  Builder as CoreBuilder,
  Functions,
  QueryBuilder as CoreQueryBuilder,
  InsertBuilder as CoreInsertBuilder,
  UpdateBuilder as CoreUpdateBuilder,
  DeleteBuilder as CoreDeleteBuilder,
  SchemaBuilder as CoreSchemaBuilder,
  TypeBuilder as CoreTypeBuilder,
  ConstraintBuilder as CoreConstraintBuilder,
  DefaultBuilder as CoreDefaultBuilder,
} from 'sij-core';
import { PgExtension } from '../ast';
import { PgQueryBuilder } from './query';
import { QualifiedTable } from 'sij-core/util';
import { PgInsertBuilder } from './insert';
import { PgUpdateBuilder } from './update';
import { PgDeleteBuilder } from './delete';
import { PgSchemaBuilder } from './schema';
import { PgTypeBuilder } from './type';
import { PgConstraintBuilder } from './constraint';
import { PgDefaultBuilder } from './default';

class PgBuilder<Schema> extends CoreBuilder<Schema, PgExtension> {
  override dialect = 'PostgreSQL';
  constructor(
    readonly fn: Functions<Schema, { [P in string]: any }, PgExtension>,
    readonly QueryBuilder: typeof CoreQueryBuilder = PgQueryBuilder as typeof CoreQueryBuilder,
    readonly InsertBuilder: typeof CoreInsertBuilder = PgInsertBuilder as typeof CoreInsertBuilder,
    readonly UpdateBuilder: typeof CoreUpdateBuilder = PgUpdateBuilder as typeof CoreUpdateBuilder,
    readonly DeleteBuilder: typeof CoreDeleteBuilder = PgDeleteBuilder as typeof CoreDeleteBuilder,
    readonly SchemaBuilder: typeof CoreSchemaBuilder = PgSchemaBuilder as typeof SchemaBuilder,
    readonly TypeBuilder: typeof CoreTypeBuilder = PgTypeBuilder,
    readonly ConstraintBuilder: typeof CoreConstraintBuilder = PgConstraintBuilder as typeof CoreConstraintBuilder,
    readonly DefaultBuilder: typeof CoreDefaultBuilder = PgDefaultBuilder,
  ) {
    super(fn);
  }
  override from<TableName extends keyof Schema & string>(
    table?: TableName,
  ): PgQueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}> {
    return super.from(table) as PgQueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}>;
  }

  override insertInto<TableName extends keyof Schema & string>(
    table: TableName,
  ): PgInsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number> {
    return super.insertInto(table) as PgInsertBuilder<
      Schema,
      Schema[TableName] & QualifiedTable<Schema, TableName>,
      number
    >;
  }

  override update<TableName extends keyof Schema & string>(
    table: TableName,
  ): PgUpdateBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number> {
    return super.update(table) as PgUpdateBuilder<
      Schema,
      Schema[TableName] & QualifiedTable<Schema, TableName>,
      number
    >;
  }

  override deleteFrom<TableName extends keyof Schema & string>(table: TableName) {
    return super.deleteFrom(table) as PgDeleteBuilder<
      Schema,
      Schema[TableName] & QualifiedTable<Schema, TableName>,
      number
    >;
  }

  override get schema(): PgSchemaBuilder<Schema, number> {
    return super.schema() as PgSchemaBuilder<Schema, number>;
  }

  override get type(): PgTypeBuilder {
    return super.type;
  }

  override get constraint(): PgConstraintBuilder<Schema> {
    return super.constraint;
  }

  override get default(): PgDefaultBuilder {
    return super.default;
  }
}

export { PgFunctions } from './functions';

export {
  PgBuilder,
  PgQueryBuilder,
  PgInsertBuilder,
  PgUpdateBuilder,
  PgDeleteBuilder,
  PgSchemaBuilder,
  PgConstraintBuilder,
  PgTypeBuilder,
  PgDefaultBuilder,
};
