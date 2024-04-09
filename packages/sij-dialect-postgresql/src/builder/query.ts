import { MakeJoinTable, QueryBuilder } from 'sij-core';
import { PgExtension } from '../ast';
import { AstToAlias, StringKeys, SubBuilder, TableOf, TypedAst, UnQualifiedTable, WithAlias } from 'sij-core/util';
import { Expr, JoinKind } from 'sij-core/ast';

class PgQueryBuilder<Schema, Table, Return> extends QueryBuilder<Schema, Table, Return, PgExtension> {
  override selectAs<
  Alias extends string,
  Ret,
  Id extends keyof Table & string,
  Col extends Id | TypedAst<Schema, Ret, Expr<PgExtension>>,
>(
  alias: Alias,
  col: Col,
): PgQueryBuilder<
  Schema,
  TableOf<Table, AstToAlias<Col, Alias>> & Table,
  UnQualifiedTable<TableOf<Table, AstToAlias<Col, Alias>>> & Return
> {
  return super.selectAs(alias, col) as PgQueryBuilder<
  Schema,
  TableOf<Table, AstToAlias<Col, Alias>> & Table,
  UnQualifiedTable<TableOf<Table, AstToAlias<Col, Alias>>> & Return
>
}
  // We need to override all of the superclass methods with new return types to expose our added methods on the builder
  override select<
    Alias extends string,
    ColType,
    Id extends keyof Table & string,
    Col extends Id | '*' | WithAlias<Alias, TypedAst<Schema, ColType, Expr<PgExtension>>>,
  >(
    ...cols: Array<Col>
  ): PgQueryBuilder<Schema, TableOf<Table, Col> & Table, UnQualifiedTable<TableOf<Table, Col>> & Return> {
    return super.select(...cols) as PgQueryBuilder<
      Schema,
      TableOf<Table, Col> & Table,
      UnQualifiedTable<TableOf<Table, Col>> & Return
    >;
  }

  override selectExpr<Alias extends string, ColType>(
    ...cols: Array<WithAlias<Alias, TypedAst<Schema, ColType, Expr<PgExtension>>>>
  ): PgQueryBuilder<
    Schema,
    { [K in Alias]: ColType } & Table,
    UnQualifiedTable<{ [K in Alias]: ColType }> & Return
  > {
    return super.selectExpr(...cols) as PgQueryBuilder<
    Schema,
    { [K in Alias]: ColType } & Table,
    UnQualifiedTable<{ [K in Alias]: ColType }> & Return
  >;
  }

  override join<
    TableName extends keyof Schema & string,
    Alias extends string,
    SubTable,
    JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, PgExtension>>,
  >(
    kind: JoinKind,
    table: JoinTable,
    on: SubBuilder<
      QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, PgExtension>,
      TypedAst<Schema, any, Expr<PgExtension>>
    >,
  ): PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return> {
    return super.join(kind, table, on) as PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return>
  }

  override leftJoin<
    TableName extends keyof Schema & string,
    Alias extends string,
    SubTable,
    JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, PgExtension>>,
  >(
    table: JoinTable,
    on: SubBuilder<
      QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, PgExtension>,
      TypedAst<Schema, any, Expr<PgExtension>>
    >,
  ): PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return> {
    return super.leftJoin(table, on) as PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return>;
  }

  rightJoin<
    TableName extends keyof Schema & string,
    Alias extends string,
    SubTable,
    JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, PgExtension>>,
  >(
    table: JoinTable,
    on: SubBuilder<
      QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, PgExtension>,
      TypedAst<Schema, any, Expr<PgExtension>>
    >,
  ): PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return> {
    return super.rightJoin(table, on) as PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return>
  }

  fullOuterJoin<
    TableName extends keyof Schema & string,
    Alias extends string,
    SubTable,
    JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, PgExtension>>,
  >(
    table: JoinTable,
    on: SubBuilder<
      QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, PgExtension>,
      TypedAst<Schema, any, Expr<PgExtension>>
    >,
  ): PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return> {
    return super.fullOuterJoin(table, on) as PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return>;
  }

  innerJoin<
    TableName extends keyof Schema & string,
    Alias extends string,
    SubTable,
    JoinTable extends TableName | WithAlias<Alias, QueryBuilder<Schema, any, SubTable, PgExtension>>,
  >(
    table: JoinTable,
    on: SubBuilder<
      QueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return, PgExtension>,
      TypedAst<Schema, any, Expr<PgExtension>>
    >,
  ): PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return> {
    return super.innerJoin(table, on) as PgQueryBuilder<Schema, Table & MakeJoinTable<Schema, JoinTable, Alias>, Return>
  }

  with<Table2, TableName extends string>(
    alias: TableName,
    sub: QueryBuilder<Schema, Table2, Return, PgExtension>,
  ): PgQueryBuilder<Schema, Table & { [K in StringKeys<Table2> as `${TableName}.${K}`]: Table2[K] }, Return> {
    return super.with(alias, sub) as PgQueryBuilder<Schema, Table & { [K in StringKeys<Table2> as `${TableName}.${K}`]: Table2[K] }, Return>;
  }

  orderBy<Id extends keyof Table & string, Exp extends Expr<PgExtension>, Col extends Id | Exp>(
    col: Col,
    opts?: { order?: 'ASC' | 'DESC'; nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
  ): PgQueryBuilder<Schema, Table, Return> {
    return super.orderBy(col, opts) as PgQueryBuilder<Schema, Table, Return>;
  }

  orderByAsc<Id extends keyof Table & string, Exp extends Expr<PgExtension>, Col extends Id | Exp>(
    col: Col,
    opts?: { nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
  ): PgQueryBuilder<Schema, Table, Return> {
    return super.orderByAsc(col, opts) as PgQueryBuilder<Schema, Table, Return>
  }

  orderByDesc<Id extends keyof Table & string, Exp extends Expr<Ext>, Col extends Id | Exp>(
    col: Col,
    opts?: { nullHandling?: 'NULLS FIRST' | 'NULLS LAST' },
  ): PgQueryBuilder<Schema, Table, Return> {
    return super.orderByDesc(col, opts) as PgQueryBuilder<Schema, Table, Return>
  }

  limit(expr: Expr<PgExtension> | number): PgQueryBuilder<Schema, Table, Return> {
    return super.limit(expr) as PgQueryBuilder<Schema, Table, Return>
  }

  offset(expr: Expr<PgExtension> | number): PgQueryBuilder<Schema, Table, Return> {
    return super.offset(expr) as PgQueryBuilder<Schema, Table, Return>
  }

  where(
    clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<PgExtension>>,
  ): PgQueryBuilder<Schema, Table, Return> {
    return super.where(clause) as PgQueryBuilder<Schema, Table, Return>;
  }

  groupBy<Id extends keyof Table & string, Exp extends Expr<Ext>, Col extends Id | Exp>(
    ...cols: Array<Col>
  ): QueryBuilder<Schema, Table, Return, Ext> {
    const makeColumn = (col: Col): Expr<Ext> => {
      if (typeof col === 'object') {
        return col as Expr<Ext>;
      }
      return Ident(col);
    };
    const columns = cols.map(makeColumn);
    return new (this.constructor as typeof QueryBuilder)(
      lens<Query<Ext>>().selection.groupBy.set(e => [...e, ...columns])(this._statement),
      this.fn as any,
    );
  }

  /**
   * `having [expr]`
   * @param clause Either an expression that evaluates to a boolean or a
   *        shorthand equality object mapping columns to values.
   */
  having(
    clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<Ext>>,
  ): QueryBuilder<Schema, Table, Return, Ext> {
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
    const updateHaving = (old: Expr<Ext> | null): Expr<Ext> => {
      if (old === null) {
        return expr;
      }
      return this.fn.and(ast<Schema, boolean, Expr<Ext>>(old), ast<Schema, boolean, Expr<Ext>>(expr)).ast;
    };
    return new (this.constructor as typeof QueryBuilder)(
      lens<Query<Ext>>().selection.having.set(e => updateHaving(e))(this._statement),
      this.fn as any,
    );
  }

  /**
   * Removes all type information from the builder allowing you to select whatever
   * you want and get back the any type. This should never be necessary as the SIJ
   * builder includes a complete typing of SQL but in situations where SIJ has a bug
   * you can continue using it while waiting for the upstream to be fixed.
   */
  unTyped(): QueryBuilder<any, any, any, Ext> {
    return this;
  }

  get foo() {
    return 5
  }
}

export { PgQueryBuilder };
