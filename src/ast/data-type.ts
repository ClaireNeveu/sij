import { Tagged, UnTag, tag } from './util';

/**
 * Datatypes defined in SQL.
 * @typeParam Ext Any datatypes added by a SQL dialect, defaults to `never`.
 */
type DataType =
  | Char
  | VarChar
  | Clob
  | Binary
  | VarBinary
  | Blob
  | Decimal
  | Float
  | Uuid
  | SmallInt
  | Int
  | BigInt
  | Real
  | Double
  | Boolean
  | Date
  | Time
  | Timestamp
  | Interval
  | Text
  | Bytea
  | Custom;

type Uuid = { readonly _tag: 'Uuid' };
const Uuid: Uuid = { _tag: 'Uuid' };

type SmallInt = { readonly _tag: 'SmallInt' };
const SmallInt: SmallInt = { _tag: 'SmallInt' };

type Int = { readonly _tag: 'Int' };
const Int: Int = { _tag: 'Int' };

type BigInt = { readonly _tag: 'BigInt' };
const BigInt: BigInt = { _tag: 'BigInt' };

type Real = { readonly _tag: 'Real' };
const Real: Real = { _tag: 'Real' };

type Double = { readonly _tag: 'Double' };
const Double: Double = { _tag: 'Double' };

type Boolean = { readonly _tag: 'Boolean' };
const Boolean: Boolean = { _tag: 'Boolean' };

type Date = { readonly _tag: 'Date' };
const Date: Date = { _tag: 'Date' };

type Time = { readonly _tag: 'Time' };
const Time: Time = { _tag: 'Time' };

type Timestamp = { readonly _tag: 'Timestamp' };
const Timestamp: Timestamp = { _tag: 'Timestamp' };

type Interval = { readonly _tag: 'Interval' };
const Interval: Interval = { _tag: 'Interval' };

type Text = { readonly _tag: 'Text' };
const Text: Text = { _tag: 'Text' };

type Bytea = { readonly _tag: 'Bytea' };
const Bytea: Bytea = { _tag: 'Bytea' };

type Char = Tagged<'Char', { readonly size: number | null }>;
const Char = (size?: number): Char => tag('Char', { size: size ?? null });

type VarChar = Tagged<'VarChar', { readonly size: number | null }>;
const VarChar = (size?: number): VarChar => tag('VarChar', { size: size ?? null });

type Clob = Tagged<'Clob', { readonly size: number }>;
const Clob = (size: number): Clob => tag('Clob', { size });

type Binary = Tagged<'Binary', { readonly size: number }>;
const Binary = (size: number): Binary => tag('Binary', { size });

type VarBinary = Tagged<'VarBinary', { readonly size: number }>;
const VarBinary = (size: number): VarBinary => tag('VarBinary', { size });

type Blob = Tagged<'Blob', { readonly size: number }>;
const Blob = (size: number): Blob => tag('Blob', { size });

type Decimal = Tagged<
  'Decimal',
  {
    readonly precision: number | null;
    readonly scale: number | null;
  }
>;
const Decimal = (args: UnTag<Decimal>): Decimal => tag('Decimal', args);

type Float = Tagged<
  'Float',
  {
    readonly precision: number | null;
  }
>;
const Float = (prec: number | null): Float => tag('Float', { precision: prec ?? null });

/* Postgres only
type Array = Tagged<'Array', {
    readonly wrapped: DataType
}>;
const Array = (wrapped: DataType): Array => tag('Array', { wrapped });
*/

/**
 * Custom type like an enum
 */
type Custom = Tagged<
  'Custom',
  {
    readonly name: string;
  }
>;
const Custom = (name: string): Custom => tag('Custom', { name });

export {
  DataType,
  Char,
  VarChar,
  Uuid,
  SmallInt,
  Int,
  BigInt,
  Real,
  Double,
  Boolean,
  Date,
  Time,
  Timestamp,
  Interval,
  Text,
  Bytea,
  Clob,
  Binary,
  VarBinary,
  Blob,
  Decimal,
  Float,
  Custom,
};
