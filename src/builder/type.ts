import {
  Binary,
  Blob,
  Boolean,
  Bytea,
  Char,
  Clob,
  Custom,
  Decimal,
  Double,
  Float,
  Int,
  Interval,
  Real,
  SmallInt,
  SqlBigInt,
  SqlDate,
  Text,
  Time,
  Timestamp,
  Uuid,
  VarBinary,
  VarChar,
} from '../ast';

class TypeBuilder {
  char(size?: number): Char {
    return Char(size);
  }
  varChar(size?: number): VarChar {
    return VarChar(size);
  }
  clob(size: number): Clob {
    return Clob(size);
  }
  binary(size: number): Binary {
    return Binary(size);
  }
  varBinary(size: number): VarBinary {
    return VarBinary(size);
  }
  blob(size: number): Blob {
    return Blob(size);
  }
  decimal(): Decimal;
  decimal(args: { precision: number }): Decimal;
  decimal(args: { precision: number; scale: number }): Decimal;
  decimal(args: { precision?: number; scale?: number } = {}): Decimal {
    return Decimal({
      precision: args.precision ?? null,
      scale: args.scale ?? null,
    });
  }
  float(size?: number): Float {
    return Float(size ?? null);
  }
  get uuid(): Uuid {
    return Uuid;
  }
  get smallInt(): SmallInt {
    return SmallInt;
  }
  get int(): Int {
    return Int;
  }
  get bigInt(): SqlBigInt {
    return SqlBigInt;
  }
  get real(): Real {
    return Real;
  }
  get double(): Double {
    return Double;
  }
  get boolean(): Boolean {
    return Boolean;
  }
  get date(): SqlDate {
    return SqlDate;
  }
  get time(): Time {
    return Time;
  }
  get timestamp(): Timestamp {
    return Timestamp;
  }
  get interval(): Interval {
    return Interval;
  }
  get text(): Text {
    return Text;
  }
  get bytea(): Bytea {
    return Bytea;
  }
  custom(name: string): Custom {
    return Custom(name);
  }
}

export { TypeBuilder };
