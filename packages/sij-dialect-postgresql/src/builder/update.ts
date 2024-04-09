import { UpdateBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgUpdateBuilder<Schema, Table, Return> extends UpdateBuilder<Schema, Table, Return, PgExtension> {}

export { PgUpdateBuilder };
