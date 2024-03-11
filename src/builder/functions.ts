import { Extension, NoExtension } from '../ast/util';
import { BinaryApp, FunctionApp, Ident, Expr, CompoundIdentifier, UnaryApp } from '../ast/expr';
import { BinaryOperator as BinOp, UnaryOperator as UnOp } from '../ast/operator';

import { BuilderExtension, ColumnOfType, TypedAst, ast, ColumnOf } from './util';

/**
 * Creates an Identifier, handling '.' for compound identifiers.
 */
const makeIdent = <Ext extends Extension>(name: string): Expr<Ext> => {
  const idParts = name.split('.');
  if (idParts.length === 1) {
    return Ident(idParts[0] as string);
  } else {
    return CompoundIdentifier(idParts.map(Ident));
  }
};

// export type GetFunctions<F> = F extends Functions<infer S, infer T, infer E> ? F & E['builder']['functions']<S, T, E> : nothing;

export class Functions<Schema, Table, Ext extends BuilderExtension> {
  protected _unop<Type, Return>(
    op: UnOp,
    val: ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  ): TypedAst<Schema, Return, UnaryApp<Ext>> {
    const expr = typeof val === 'string' ? makeIdent<Ext>(val) : (val as TypedAst<Schema, Type, Expr<Ext>>).ast;
    return ast<Schema, Return, UnaryApp<Ext>>(
      UnaryApp({
        op,
        expr,
      }),
    );
  }

  protected _binop<Type, Return>(
    op: BinOp,
    left: ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    right: ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  ): TypedAst<Schema, Return, BinaryApp<Ext>> {
    const left_ = typeof left === 'string' ? makeIdent<Ext>(left) : (left as TypedAst<Schema, Type, Expr<Ext>>).ast;
    const right_ = typeof right === 'string' ? makeIdent<Ext>(right) : (right as TypedAst<Schema, Type, Expr<Ext>>).ast;
    return ast<Schema, Return, BinaryApp<Ext>>(
      BinaryApp({
        op,
        left: left_,
        right: right_,
      }),
    );
  }

  protected _function<Type, Return>(
    name: string,
    args: Array<ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>>,
  ): TypedAst<Schema, Return, FunctionApp<Ext>> {
    const args_ = args.map(a =>
      typeof a === 'string' ? makeIdent<Ext>(a) : (a as TypedAst<Schema, Type, Expr<Ext>>).ast,
    );
    return ast<Schema, Return, FunctionApp<Ext>>(
      FunctionApp({
        name: CompoundIdentifier([Ident(name)]),
        args: args_,
      }),
    );
  }

  /**
   * `+[val]`
   * Denotes an unsigned integer.
   */
  pos<Numeric extends Ext['builder']['types']['numeric']>(
    val: ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  ): TypedAst<Schema, Numeric, UnaryApp<Ext>> {
    return this._unop<Numeric, Numeric>(UnOp.Plus, val);
  }

  /**
   * `-[val]`
   * Negates a numeric value.
   */
  neg<Numeric extends Ext['builder']['types']['numeric']>(
    val: ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  ): TypedAst<Schema, Numeric, UnaryApp<Ext>> {
    return this._unop<Numeric, Numeric>(UnOp.Minus, val);
  }

  /**
   * `NOT [val]`
   * Negates a boolean value turning TRUE into FALSE and vice versa.
   */
  not<Boolean extends Ext['builder']['types']['boolean']>(
    val: ColumnOfType<Boolean, Table> | TypedAst<Schema, Boolean, Expr<Ext>>,
  ): TypedAst<Schema, boolean, UnaryApp<Ext>> {
    return this._unop<Boolean, boolean>(UnOp.Not, val);
  }

  //
  // In the binary operators we need to add type parameters for the columns
  // Otherwise Typescript treats ColumnOfType<Type, Table> as never. Not
  // sure what exactly is at play there.
  //

  /**
   * `[left] = [right]`
   * Tests whether two values are equivalent. NULL values are not equal to each other.
   */
  equal<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.Equal, left, right);
  }
  eq = this.equal;

  /**
   * `[left] <> [right]`
   * Tests whether two values are not equivalent. NULL values are not equal to each other.
   */
  notEqual<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.NotEqual, left, right);
  }
  neq = this.notEqual;

  /**
   * `[left] > [right]`
   * Tests whether the left value is greater than the right value.
   * Numbers are compared numerically, string comparison uses the
   * collation set for the column, dates are compared chronologically.
   */
  greaterThan<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.Greater, left, right);
  }
  gt = this.greaterThan;

  /**
   * `[left] < [right]`
   * Tests whether the left value is less than the right value.
   * Numbers are compared numerically, string comparison uses the
   * collation set for the column, dates are compared chronologically.
   */
  lessThan<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.Less, left, right);
  }
  lt = this.lessThan;

  /**
   * `[left] >= [right]`
   * Tests whether the left value is greater than or equal to the right value.
   * Numbers are compared numerically, string comparison uses the
   * collation set for the column, dates are compared chronologically.
   */
  greaterThanOrEqualTo<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.GreaterEqual, left, right);
  }
  gte = this.greaterThanOrEqualTo;

  /**
   * `[left] <= [right]`
   * Tests whether the left value is less than or equal to the right value.
   * Numbers are compared numerically, string comparison uses the
   * collation set for the column, dates are compared chronologically.
   */
  lessThanOrEqualTo<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.LessEqual, left, right);
  }
  lte = this.lessThanOrEqualTo;

  /**
   * `[left] AND [right]`
   */
  and<
    Boolean extends Ext['builder']['types']['boolean'],
    Col1 extends ColumnOfType<Boolean, Table> | TypedAst<Schema, Boolean, Expr<Ext>>,
    Col2 extends ColumnOfType<Boolean, Table> | TypedAst<Schema, Boolean, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Boolean, boolean>(BinOp.And, left, right);
  }

  /**
   * `[left] OR [right]`
   */
  or<
    Boolean extends Ext['builder']['types']['boolean'],
    Col1 extends ColumnOfType<Boolean, Table> | TypedAst<Schema, Boolean, Expr<Ext>>,
    Col2 extends ColumnOfType<Boolean, Table> | TypedAst<Schema, Boolean, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Boolean, boolean>(BinOp.Or, left, right);
  }

  /**
   * `[left] LIKE [right]`
   */
  like<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.Like, left, right);
  }

  /**
   * `[left] NOT LIKE [right]`
   */
  notLike<
    Type,
    Col1 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
    Col2 extends ColumnOfType<Type, Table> | TypedAst<Schema, Type, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, boolean, BinaryApp<Ext>> {
    return this._binop<Type, boolean>(BinOp.NotLike, left, right);
  }

  /**
   * `[left] + [right]`
   */
  add<
    Numeric extends Ext['builder']['types']['numeric'],
    Col1 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    Col2 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
    return this._binop<Numeric, Numeric>(BinOp.Plus, left, right);
  }

  /** `[left] - [right]` */
  subtract<
    Numeric extends Ext['builder']['types']['numeric'],
    Col1 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    Col2 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
    return this._binop<Numeric, Numeric>(BinOp.Minus, left, right);
  }

  /** `[left] * [right]` */
  multiply<
    Numeric extends Ext['builder']['types']['numeric'],
    Col1 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    Col2 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  >(left: Col1, right: Col2): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
    return this._binop<Numeric, Numeric>(BinOp.Multiply, left, right);
  }

  /** `[left] / [right]` */
  divide<
    Numeric extends Ext['builder']['types']['numeric'],
    Col extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    Col2 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  >(left: Col, right: Col2): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
    return this._binop<Numeric, Numeric>(BinOp.Divide, left, right);
  }

  /** `[left] % [right]` */
  mod<
    Numeric extends Ext['builder']['types']['numeric'],
    Col extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    Col2 extends ColumnOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
  >(left: Col, right: Col2): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
    return this._binop<Numeric, Numeric>(BinOp.Modulus, left, right);
  }

  /** `[left] || [right]` */
  concat<
      String extends Ext['builder']['types']['string'],
      Col extends ColumnOfType<String, Table> | TypedAst<Schema, String, Expr<Ext>>,
      Col2 extends ColumnOfType<String, Table> | TypedAst<Schema, String, Expr<Ext>>,
  >(
      left: Col,
      right: Col2,
  ): TypedAst<Schema, String, BinaryApp<Ext>> {
      return this._binop<String, String>(BinOp.StringConcat, left, right);
  }
}
