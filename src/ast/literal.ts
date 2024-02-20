import { Tagged, tag } from './util';

type Literal = NumLit | StringLit | BoolLit | NullLit | DateLit | CustomLit;

type NumLit = Tagged<'NumLit', { val: number | string }>;
const NumLit = (val: number | string): Literal => tag('NumLit', { val });

type StringLit = Tagged<'StringLit', { val: string }>;
const StringLit = (val: string): Literal => tag('StringLit', { val });

type BoolLit = Tagged<'BoolLit', { val: boolean }>;
const BoolLit = (val: boolean): Literal => tag('BoolLit', { val });

type NullLit = Tagged<'NullLit', {}>;
const NullLit: Literal = { _tag: 'NullLit' };

type DateLit = Tagged<'DateLit', { val: Date }>;
const DateLit = (val: Date): Literal => tag('DateLit', { val });

/**
 * Literal supplied by an extension.
 */
type CustomLit = Tagged<'CustomLit', { val: any }>;
const CustomLit = (val: any): Literal => tag('CustomLit', { val });

export { Literal, NumLit, StringLit, BoolLit, NullLit, DateLit, CustomLit };
