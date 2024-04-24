import { InsertBuilder, QueryBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { DefaultValue, Expr } from 'sij-core/ast';

class PgInsertBuilder<Schema, Table, Return> extends InsertBuilder<Schema, Table, Return, PgExtension> {
  override apply<T>(fn: (arg: PgInsertBuilder<Schema, Table, Return>) => T): T {
    return fn(this);
  }

  override lit<Return extends number | string | boolean | null>(
    l: Return,
  ): TypedAst<Schema, Return, Expr<PgExtension>> {
    return super.lit(l);
  }

  override values(
    ...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Expr<PgExtension>> }>
  ): Omit<PgInsertBuilder<Schema, Table, Return>, 'fromQuery' | 'columns'> {
    return super.values(...vs);
  }

  override values1(
    ...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Expr<PgExtension>> }>
  ): Omit<PgInsertBuilder<Schema, Table, Return>, 'fromQuery' | 'columns'> {
    return super.values1(...vs);
  }

  override columns(...columns: Array<keyof Table>): Omit<PgInsertBuilder<Schema, Table, Return>, 'columns'> {
    return super.columns(...columns);
  }

  override fromQuery<QReturn extends { [Key in keyof Table]?: Table[Key] }>(
    query: QueryBuilder<Schema, any, QReturn, PgExtension>,
  ): Omit<PgInsertBuilder<Schema, Table, Return>, 'values' | 'values1' | 'columns'> {
    return super.fromQuery(query);
  }
}
// Merges with above class to provide calling as a function
interface PgInsertBuilder<Schema, Table, Return> extends InsertBuilder<Schema, Table, Return, PgExtension> {
  <T>(fn: (arg: PgInsertBuilder<Schema, Table, Return>) => T): T;
}

export { PgInsertBuilder };
