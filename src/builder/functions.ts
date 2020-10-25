import { Extension, NoExtension } from '../ast/util';
import { BinaryApp, FunctionApp, Ident, Expr, CompoundIdentifier, UnaryApp } from '../ast/expr';
import { BinaryOperator as BinOp, UnaryOperator as UnOp } from '../ast/operator';

import { BuilderExtension, KeysOfType, TypedAst, ast } from './util';

export type StringKeys<T> = (keyof T) extends string ? keyof T : never;

const makeIdent = <Ext extends Extension>(name: string): Expr<Ext> => {
    const idParts = (name).split('.');
    if (idParts.length === 1) {
        return Ident(idParts[0] as string);
    } else {
        return CompoundIdentifier(idParts.map(Ident));
    }
};

type Numeric = number | bigint;

// TODO functions need their return type determined by their input
// so if `add` is called with a `number` column it needs to return a TypedAst of number
// and a bigint for bigint columns.
export class Functions<Schema, Table, Ext extends BuilderExtension> {
    /** `CHAR_LENGTH([value])` */
    charLength<
        Col extends ((keyof Table) & string) | TypedAst<Schema, string, Expr<Ext>>,
    >(
        value: Col
    ): TypedAst<Schema, number, FunctionApp<Ext>> {
        const args = typeof value === 'string' ? [makeIdent<Ext>(value)] : [(value as TypedAst<Schema, string, Expr<Ext>>).ast];
        return ast<Schema, number, FunctionApp<Ext>>(FunctionApp({
            name: CompoundIdentifier([Ident('CHAR_LENGTH')]),
            args,
        }));
    }
    /** `+[val]` */
    pos<
        Numeric extends Ext['builder']['types']['numeric'],
        Col extends KeysOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        val: Col,
    ): TypedAst<Schema, Numeric, UnaryApp<Ext>> {
        const expr = typeof val === 'string' ? makeIdent<Ext>(val) : (val as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, UnaryApp<Ext>>(UnaryApp({
            op: UnOp.Plus,
            expr
        }));
    }
    /** `-[val]` */
    neg<
        Numeric extends Ext['builder']['types']['numeric'],
        Col extends KeysOfType<Numeric, Table> | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        val: Col,
    ): TypedAst<Schema, Numeric, UnaryApp<Ext>> {
        const expr = typeof val === 'string' ? makeIdent<Ext>(val) : (val as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, UnaryApp<Ext>>(UnaryApp({
            op: UnOp.Minus,
            expr
        }));
    }
    /** `NOT [val]` */
    not<
        Col extends ((keyof Table) & string) | TypedAst<Schema, boolean, Expr<Ext>>,
    >(
        val: Col,
    ): TypedAst<Schema, boolean, UnaryApp<Ext>> {
        const expr = typeof val === 'string' ? makeIdent<Ext>(val) : (val as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, UnaryApp<Ext>>(UnaryApp({
            op: UnOp.Not,
            expr
        }));
    }
    /** `[left] = [right]` */
    equal<
        Col extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Equal,
            left,
            right,
        }));
    }
    eq = this.equal
    /** `[left] <> [right]` */
    notEqual<
        Col extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.NotEqual,
            left,
            right,
        }));
    }
    neq = this.notEqual
    /** `[left] > [right]` */
    greaterThan<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Greater,
            left,
            right,
        }));
    }
    gt = this.greaterThan
    /** `[left] < [right]` */
    lessThan<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Less,
            left,
            right,
        }));
    }
    lt = this.lessThan
    /** `[left] >= [right]` */
    greaterThanOrEqualTo<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.GreaterEqual,
            left,
            right,
        }));
    }
    gte = this.greaterThanOrEqualTo
    /** `[left] <= [right]` */
    lessThanOrEqualTo<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.LessEqual,
            left,
            right,
        }));
    }
    lte = this.lessThanOrEqualTo
    /** `[left] AND [right]` */
    and<
        Col extends ((keyof Table) & string) | TypedAst<Schema, boolean, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, boolean, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        return  ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.And,
            left,
            right,
        }));
    }
    /** `[left] OR [right]` */
    or<
        Col extends ((keyof Table) & string) | TypedAst<Schema, boolean, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, boolean, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        return  ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Or,
            left,
            right,
        }));
    }
    /** `[left] LIKE [right]` */
    like<
        Col extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        return  ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Like,
            left,
            right,
        }));
    }
    /** `[left] NOT LIKE [right]` */
    notLike<
        Col extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, any, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, boolean, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, boolean, Expr<Ext>>).ast;
        return  ast<Schema, boolean, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.NotLike,
            left,
            right,
        }));
    }
    /** `[left] + [right]` */
    add<
        Numeric extends Ext['builder']['types']['numeric'],
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Plus,
            left,
            right,
        }));
    }
    /** `[left] - [right]` */
    subtract<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Minus,
            left,
            right,
        }));
    }
    /** `[left] * [right]` */
    multiply<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Multiply,
            left,
            right,
        }));
    }
    /** `[left] / [right]` */
    divide<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Divide,
            left,
            right,
        }));
    }
    /** `[left] % [right]` */
    mod<
        Col extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, Numeric, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, Numeric, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, Numeric, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.Modulus,
            left,
            right,
        }));
    }
    /** `[left] || [right]` */
    concat<
        Col extends ((keyof Table) & string) | TypedAst<Schema, string, Expr<Ext>>,
        Col2 extends ((keyof Table) & string) | TypedAst<Schema, string, Expr<Ext>>,
    >(
        left_: Col,
        right_: Col2,
    ): TypedAst<Schema, string, BinaryApp<Ext>> {
        const left = typeof left_ === 'string' ? makeIdent<Ext>(left_) : (left_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        const right = typeof right_ === 'string' ? makeIdent<Ext>(right_) : (right_ as TypedAst<Schema, any, Expr<Ext>>).ast;
        return ast<Schema, string, BinaryApp<Ext>>(BinaryApp({
            op: BinOp.StringConcat,
            left,
            right,
        }));
    }
};
