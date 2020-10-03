import type { VTagged } from './util';

type Literal =
  | NumLit
  | StringLit
  | BoolLit
  | NullLit;


type NumLit = VTagged<'NumLit', string>;
const NumLit = (val: number | string): NumLit => (typeof val === 'string' ? val : '' + val) as NumLit;

type StringLit = VTagged<'StringLit', string>;
const StringLit = (val: string): StringLit => `'val'` as StringLit;

type BoolLit = VTagged<'BoolLit', string>;
const BoolLit = (val: boolean): BoolLit => (val ? 'TRUE' : 'FALSE') as BoolLit;

type NullLit = VTagged<'NullLit', string>;
const NullLit = 'NULL' as NullLit;

export {
    Literal,
    NumLit,
    StringLit,
    BoolLit,
    NullLit,
};
