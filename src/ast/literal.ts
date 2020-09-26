import type { VTagged } from './util';

type Literal =
  | NumLit
  | StringLit
  | BoolLit
  | NullLit;


type NumLit = VTagged<'NumLit', string>;
const NumLit = (val: number | string): NumLit => (typeof val === 'string' ? val : '' + val) as NumLit;

type StringLit = VTagged<'StringLit', string>;
const StringLit = (val: string): StringLit => val as StringLit;

type BoolLit = VTagged<'BoolLit', boolean>;
const BoolLit = (val: boolean): BoolLit => val as BoolLit;

type NullLit = { _tag: 'NullLit' };
const NullLit = { _tag: 'NullLit' };

const literalToString = (l: Literal): string => (typeof l === 'object') ? 'NULL' : '' + l;

export {
    Literal,
    NumLit,
    StringLit,
    BoolLit,
    NullLit,
    literalToString,
};
