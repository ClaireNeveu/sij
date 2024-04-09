import { InsertBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgInsertBuilder<Schema, Table, Return> extends InsertBuilder<Schema, Table, Return, PgExtension> {}

export { PgInsertBuilder };
