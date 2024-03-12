import CallableInstance from 'callable-instance';
import { lens } from 'lens.ts';

import { Expr, Ident, Lit } from '../ast/expr';
import { DefaultValue, Insert, ValuesConstructor, ValuesQuery } from '../ast/statement';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { Functions } from './functions';
import { BuilderExtension, NoBuilderExtension, WithAlias, QualifiedTable, makeLit, TypedAst, ast } from './util';
import { QueryBuilder } from './query';

class InsertBuilder<Schema, Table, Return, Ext extends BuilderExtension> extends CallableInstance<
  Array<never>,
  unknown
> {
  constructor(
    readonly _statement: Insert<Ext>,
    readonly fn: Functions<Schema, Table, Ext>,
  ) {
    super('apply');
  }

  apply<T>(fn: (arg: InsertBuilder<Schema, Table, Return, Ext>) => T): T {
    return fn(this);
  }

  /**
   * Allows you to insert a literal into the query.
   */
  lit<Return extends number | string | boolean | null>(l: Return): TypedAst<Schema, Return, Expr<Ext>> {
    return {
      ast: makeLit(l),
    } as TypedAst<Schema, Return, Expr<Ext>>;
  }

  values(
    ...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Expr<Ext>> }>
  ): Omit<InsertBuilder<Schema, Table, Return, Ext>, 'fromQuery' | 'columns'> {
    const newInsert = (() => {
      if (this._statement.values === null) {        
        const columns: Array<string> = (() => {
          if (this._statement.columns.length > 0) {
            return this._statement.columns.map(i => i.name);
          }
          const columnSet: Set<string> = new Set();
          vs.forEach(v => {
            Object.keys(v).forEach(k => columnSet.add(k));
          });
          return Array.from(columnSet);
        })()
        const values = ValuesConstructor<Ext>({
          values: vs.map((o: { [p: string]: any }) =>
            columns.map(c => {
              const v = o[c];
              return v === undefined ? DefaultValue : typeof v === 'object' && 'ast' in v ? v.ast : makeLit(v);
            }),
          ),
        });
        const insertLens = lens<Insert<Ext>>();
        return insertLens.values.set(values)(insertLens.columns.set(columns.map(Ident))(this._statement));
      } else {
        const columns = this._statement.columns;
        const values: Array<Array<DefaultValue | Expr<Ext>>> = vs.map((o: { [p: string]: any }) =>
          columns.map(c => {
            const v = o[c.name];
            return v === undefined ? DefaultValue : typeof v === 'object' && 'ast' in v ? v.ast : makeLit(v);
          }),
        );
        const oldValues = this._statement.values;
        if (oldValues?._tag === 'ValuesConstructor') {
          return lens<Insert<Ext>>().values.set(
            lens<ValuesConstructor<Ext>>().values.set(vs => [...vs, ...values])(oldValues),
          )(this._statement);
        }
        throw new Error('Invalid insertion');
      }
    })();
    return new InsertBuilder<Schema, Table, Return, Ext>(newInsert, this.fn as Functions<Schema, any, Ext>);
  }
  /**
   * When inserting values SIJ automatically determines the columns
   * of your dataset by traversing all the keys in all the values.
   * In large datasets this can be a performance issue. `values1`
   * only looks at the first value in your dataset to determine
   * the columns.
   */
  values1(
    ...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Expr<Ext>> }>
  ): Omit<InsertBuilder<Schema, Table, Return, Ext>, 'fromQuery' | 'columns'> {
    if (vs.length === 0) {
      throw new Error('Cannot insert with no values');
    }
    const newInsert = (() => {
      if (this._statement.values === null) {
        const columns: Array<string> = this._statement.columns.length > 0 ? this._statement.columns.map(i => i.name) : Array.from(Object.keys(vs[0]));
        const values = ValuesConstructor<Ext>({
          values: vs.map((o: { [p: string]: any }) =>
            columns.map(c => {
              const v = o[c];
              return v === undefined ? DefaultValue : typeof v === 'object' && 'ast' in v ? v.ast : makeLit(v);
            }),
          ),
        });
        const insertLens = lens<Insert<Ext>>();
        return insertLens.values.set(values)(insertLens.columns.set(columns.map(Ident))(this._statement));
      } else {
        const columns = this._statement.columns;
        const values: Array<Array<DefaultValue | Expr<Ext>>> = vs.map((o: { [p: string]: any }) =>
          columns.map(c => {
            const v = o[c.name];
            return v === undefined ? DefaultValue : typeof v === 'object' && 'ast' in v ? v.ast : makeLit(v);
          }),
        );
        const oldValues = this._statement.values;
        if (oldValues?._tag === 'ValuesConstructor') {
          return lens<Insert<Ext>>().values.set(
            lens<ValuesConstructor<Ext>>().values.set(vs => [...vs, ...values])(oldValues),
          )(this._statement);
        }
        throw new Error('Invalid insertion');
      }
    })();
    return new InsertBuilder<Schema, Table, Return, Ext>(newInsert, this.fn as Functions<Schema, any, Ext>);
  }

  /**
   * When inserting values SIJ automatically determines the columns
   * of your dataset by traversing all the keys in all the values.
   * In large datasets this can be a performance issue so you can
   * use `columns` to specify the columns manually and avoid the
   * extra computation.
   */
  columns(...columns: Array<keyof Table>): Omit<InsertBuilder<Schema, Table, Return, Ext>, 'columns'> {
    if (this._statement.values !== null) {
      throw new Error('Cannot set columns after values');
    }
    const newInsert = (() => {
      const insertLens = lens<Insert<Ext>>();
      return insertLens.columns.set(columns.map(c => Ident(c as string)))(this._statement);
    })();
    return new InsertBuilder<Schema, Table, Return, Ext>(newInsert, this.fn as Functions<Schema, any, Ext>);
  }

  /**
   * Insert the result of a query into the table.
   * You cannot insert further values if inserting from a query.
   */
  fromQuery<QReturn extends { [Key in keyof Table]?: Table[Key] }>(
    query: QueryBuilder<Schema, any, QReturn, Ext>,
  ): Omit<InsertBuilder<Schema, Table, Return, Ext>, 'values' | 'values1' | 'columns'> {
    return new InsertBuilder<Schema, Table, Return, Ext>(
      lens<Insert<Ext>>().values.set(ValuesQuery({ query: query._statement }))(this._statement),
      this.fn as Functions<Schema, any, Ext>,
    );
  }
}
// Merges with above class to provide calling as a function
interface InsertBuilder<Schema, Table, Return, Ext extends BuilderExtension> {
  <T>(fn: (arg: InsertBuilder<Schema, Table, Return, Ext>) => T): T;
}

export { InsertBuilder };
