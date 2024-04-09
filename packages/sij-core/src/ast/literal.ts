import { Tagged, tag } from '../util';

type Literal = NumLit | StringLit | BoolLit | NullLit | DateLit | CustomLit;

type NumLit = Tagged<'NumLit', { val: number | string }>;
const NumLit = (val: number | string): NumLit => tag('NumLit', { val });

type StringLit = Tagged<'StringLit', { val: string }>;
const StringLit = (val: string): StringLit => tag('StringLit', { val });

type BoolLit = Tagged<'BoolLit', { val: boolean }>;
const BoolLit = (val: boolean): BoolLit => tag('BoolLit', { val });

type NullLit = Tagged<'NullLit', {}>;
const NullLit: Literal = { _tag: 'NullLit' };

type DateLit = Tagged<'DateLit', { val: Date }>;
const DateLit = (val: Date): DateLit => tag('DateLit', { val });

/**
 * Literal supplied by an extension.
 */
type CustomLit = Tagged<'CustomLit', { val: any }>;
const CustomLit = (val: any): CustomLit => tag('CustomLit', { val });

export { Literal, NumLit, StringLit, BoolLit, NullLit, DateLit, CustomLit };
