import { Tagged, tag } from './util';

type Literal =
  | NumLit
  | StringLit
  | BoolLit
  | NullLit;


type NumLit = Tagged<'NumLit', { val: number | string }>;
const NumLit = (val: number | string): Literal => tag('NumLit', { val });

type StringLit = Tagged<'StringLit', { val: string }>;
const StringLit = (val: string): Literal => tag('StringLit', { val });

type BoolLit = Tagged<'BoolLit', { val: boolean }>;
const BoolLit = (val: boolean): Literal => tag('BoolLit', { val });

type NullLit = Tagged<'NullLit', {}>;
const NullLit: Literal = { _tag: 'NullLit' };

export {
    Literal,
    NumLit,
    StringLit,
    BoolLit,
    NullLit,
};
