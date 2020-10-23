import { Expr, Ident, CompoundIdentifier, Lit, Wildcard } from '../ast/expr';
import {
    Literal,
    NumLit,
    StringLit,
    BoolLit,
    NullLit,
} from '../ast/literal';
import { Extension, NoExtension } from '../ast/util';
import { TypedAst, Functions, ast } from './functions';

export type BuilderExtension = Extension & {
    builder: {
        types: {
            numeric: number | bigint
        }
    }
};

export type NoBuilderExtension = NoExtension & {
    builder: {
        types: {
            numeric: number | bigint
        }
    }
};

export type TypeTag<T> = { __tag: T };
export const typeTag = <T>(): TypeTag<T> => null as unknown as TypeTag<T>;

export const makeLit = <Ext extends Extension>(l: number | string | boolean | null): Expr<Ext> => {
    const lit: Literal = (() => {
        if (typeof l === 'number') {
            return NumLit(l);
        } else if (typeof l === 'string') {
            return StringLit(l);
        } else if (typeof l === 'boolean') {
            return BoolLit(l);
        } else {
            return NullLit;
        }
    })();
    return Lit(lit);
};

type UnQualifiedId<P> =
    P extends `${infer Key}.${infer Rest}` ? Rest : P;

export type StringKeys<T> = (keyof T) extends string ? keyof T : never;
export type QualifiedTable<Schema, TableName extends keyof Schema & string> =
    { [Key in StringKeys<Schema[TableName]> as `${TableName}.${Key}`]: Schema[TableName][Key] };
export type QualifyTable<TableName extends string, Table> =
    { [Key in StringKeys<Table> as `${TableName}.${Key}`]: Table[Key] };
export type UnQualifiedTable<Table> =
    { [Key in keyof Table as UnQualifiedId<Key>]: Table[Key] };

export type SubBuilder<T, R> = R | ((t: T) => R);

export type WithAlias<A extends string, T> = {
    alias: A,
    val: T,
};
export const withAlias = <Col extends string, T>(name: Col, val: T): WithAlias<Col, T> => {
    return {
        alias: name,
        val,
    };
};

export type AstToAlias<T, A extends string> =
    T extends TypedAst<infer S, infer R, infer E> ? WithAlias<A, TypedAst<S, R, E>> : never;

export type TableOf<Table, T> = {
    [K in T extends keyof Table ? T
          : T extends '*' ? keyof Table
          : T extends WithAlias<infer P, TypedAst<any, infer T, any>> ? P
          : never
    ]: K extends keyof Table ? Table[K]
       : T extends WithAlias<infer P, TypedAst<any, infer T, any>> ? T
       : never
};
