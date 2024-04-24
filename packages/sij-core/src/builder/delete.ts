import CallableInstance from 'callable-instance';
import { lens } from 'lens.ts';

import { Expr, Ident, Lit } from '../ast/expr';
import { DefaultValue, Delete, Statement, ValuesConstructor, ValuesQuery } from '../ast/statement';
import { Functions } from './functions';
import { BuilderExtension, makeLit, TypedAst, ast } from './util';
import { QueryBuilder } from './query';

class DeleteBuilder<Schema, Table, Return, Ext extends BuilderExtension> extends CallableInstance<
  Array<never>,
  unknown
> {
  constructor(
    readonly _statement: Delete<Ext>,
    readonly fn: Functions<Schema, Table, Ext>,
  ) {
    super('apply');
  }

  apply<T>(fn: (arg: DeleteBuilder<Schema, Table, Return, Ext>) => T): T {
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

  /**
   * `WHERE [expr]`
   * @param clause Either an expression that evaluates to a boolean or a
   *        shorthand equality object mapping columns to values.
   */
  where(
    clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<Ext>>,
  ): DeleteBuilder<Schema, Table, Return, Ext> {
    const expr: Expr<Ext> = (() => {
      if (typeof clause === 'object' && !('ast' in clause)) {
        return Object.keys(clause)
          .map(k => {
            const val: any = (clause as any)[k] as any;
            return this.fn.eq(k as any, ast<Schema, any, Expr<Ext>>(makeLit(val)));
          })
          .reduce((acc, val) => this.fn.and(acc, val)).ast;
      }
      return clause.ast;
    })();

    const updateWhere = (old: Expr<Ext> | null): Expr<Ext> => {
      if (old === null) {
        return expr;
      }
      return this.fn.and(ast<Schema, boolean, Expr<Ext>>(old), ast<Schema, boolean, Expr<Ext>>(expr)).ast;
    };

    return new (this.constructor as typeof DeleteBuilder)(
      lens<Delete<Ext>>().where.set(e => updateWhere(e))(this._statement),
      this.fn as Functions<Schema, any, Ext>,
    );
  }

  build(): Statement<Ext> {
    return this._statement;
  }
}
// Merges with above class to provide calling as a function
interface DeleteBuilder<Schema, Table, Return, Ext extends BuilderExtension> {
  <T>(fn: (arg: DeleteBuilder<Schema, Table, Return, Ext>) => T): T;
}

export { DeleteBuilder };
