import { ConstraintBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgConstraintBuilder<Schema> extends ConstraintBuilder<Schema, PgExtension> {}

export { PgConstraintBuilder };
