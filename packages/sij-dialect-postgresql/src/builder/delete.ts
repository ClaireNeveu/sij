import { DeleteBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr } from 'sij-core/ast';

class PgDeleteBuilder<Schema, Table, Return> extends DeleteBuilder<Schema, Table, Return, PgExtension> {
  override lit<Return extends number | string | boolean | null>(
    l: Return,
  ): TypedAst<Schema, Return, Expr<PgExtension>> {
    return super.lit(l);
  }

  override where(
    clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<PgExtension>>,
  ): PgDeleteBuilder<Schema, Table, Return> {
    return super.where(clause);
  }
}
// Merges with above class to provide calling as a function
interface PgDeleteBuilder<Schema, Table, Return> extends DeleteBuilder<Schema, Table, Return, PgExtension> {
  <T>(fn: (arg: PgDeleteBuilder<Schema, Table, Return>) => T): T;
}

export { PgDeleteBuilder };
