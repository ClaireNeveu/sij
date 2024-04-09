import { SchemaBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgSchemaBuilder<Schema, Return> extends SchemaBuilder<Schema, Return, PgExtension> {}

export { PgSchemaBuilder };
