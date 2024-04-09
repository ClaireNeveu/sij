import { DefaultBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgDefaultBuilder extends DefaultBuilder<PgExtension> {}

export { PgDefaultBuilder };
