import { DeleteBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgDeleteBuilder<Schema, Table, Return> extends DeleteBuilder<Schema, Table, Return, PgExtension> {}

export { PgDeleteBuilder };
