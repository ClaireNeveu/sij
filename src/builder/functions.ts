import { Extension, NoExtension } from '../ast/util';
import { FunctionApp, Ident, Expr, CompoundIdentifier } from '../ast/expr';

export type TypedAst<Schema, Return, E> = E & { __schemaType: Schema, __returnType: Return };
export const ast = <Schema, Return, E>(e: E): TypedAst<Schema, Return, E> => e as TypedAst<Schema, Return, E>;

type DistributiveValues<T extends Record<string, any>> = T extends T ? T[keyof T] : never;

type ColumnsOf<
  T extends Record<keyof T, object>,
  K extends keyof T
> = DistributiveValues<T[K]>;

export const ascii = <Schema extends Record<string, object>, Ext extends Extension = NoExtension>(value: ColumnsOf<Schema, keyof Schema> & string): TypedAst<Schema, string, FunctionApp<Ext>> => {
    const args = typeof value === 'string' ? [Ident(value)] : [value as unknown as Expr<Ext>];
    return FunctionApp({
        name: CompoundIdentifier([Ident('ASCII')]),
        args,
    }) as TypedAst<Schema, string, FunctionApp<Ext>>;
};
/*
const characterLength = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `CHARACTER_LENGTH(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const concat = <Schema, Ext extends Extension = NoExtension>(...values: Array<string>): VTagged<Schema, FunctionApp<Ext>> => `CONCAT(${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>,
const field = <Schema, Ext extends Extension = NoExtension>(value: string, ...values: Array<string>): VTagged<Schema, FunctionApp<Ext>> => `FIELD(${hLit(value)}, ${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>,
const findInSet = <Schema, Ext extends Extension = NoExtension>(value: string, values: string): VTagged<Schema, FunctionApp<Ext>> => `FIND_IN_SET(${hLit(value)}, ${hLit(values)})` as VTagged<Schema, FunctionApp<Ext>>,
const format = <Schema, Ext extends Extension = NoExtension>(value: string, places: string): VTagged<Schema, FunctionApp<Ext>> => `FORMAT(${hLit(value)}, ${hLit(places)})` as VTagged<Schema, FunctionApp<Ext>>,
const insert = <Schema, Ext extends Extension = NoExtension>(value: string, pos: string, num: string, sub: string): VTagged<Schema, FunctionApp<Ext>> => `INSERT(${hLit(value)}, ${hLit(pos)}, ${hLit(num)}, ${hLit(sub)})` as VTagged<Schema, FunctionApp<Ext>>,
const instr = <Schema, Ext extends Extension = NoExtension>(value: string, sub: string): VTagged<Schema, FunctionApp<Ext>> => `INSTR(${hLit(value)}, ${hLit(sub)})` as VTagged<Schema, FunctionApp<Ext>>,
const left = <Schema, Ext extends Extension = NoExtension>(value: string, num: string): VTagged<Schema, FunctionApp<Ext>> => `LEFT(${hLit(value)}, ${hLit(num)})` as VTagged<Schema, FunctionApp<Ext>>,
const length = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LENGTH(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const locate = <Schema, Ext extends Extension = NoExtension>(sub: string, value: string, pos?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const pos ? `LOCATE(${hLit(sub)}, ${hLit(value)}, ${hLit(pos)})` : `LEFT(${hLit(value)}, ${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,
const lower = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LOWER(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const leftPad = <Schema, Ext extends Extension = NoExtension>(value: string, length: string, pad: string): VTagged<Schema, FunctionApp<Ext>> => `LPAD(${hLit(value)}, ${hLit(length)}, ${hLit(pad)})` as VTagged<Schema, FunctionApp<Ext>>,
const leftTrim = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LTRIM(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const mid = <Schema, Ext extends Extension = NoExtension>(value: string, pos: string, length: string): VTagged<Schema, FunctionApp<Ext>> => `MID(${hLit(value)}, ${hLit(pos)}, ${hLit(length)})` as VTagged<Schema, FunctionApp<Ext>>,
const position = <Schema, Ext extends Extension = NoExtension>(sub: string, value: string): VTagged<Schema, FunctionApp<Ext>> => `POSITION(${hLit(sub)} IN ${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const repeat = <Schema, Ext extends Extension = NoExtension>(value: string, num: string): VTagged<Schema, FunctionApp<Ext>> => `REPEAT(${hLit(value)}, ${hLit(num)})` as VTagged<Schema, FunctionApp<Ext>>,
const replace = <Schema, Ext extends Extension = NoExtension>(value: string, frm: string, to: string): VTagged<Schema, FunctionApp<Ext>> => `REPEAT(${hLit(value)}, ${hLit(frm)}, ${hLit(to)})` as VTagged<Schema, FunctionApp<Ext>>,
const reverse = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `REVERSE(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const right = <Schema, Ext extends Extension = NoExtension>(value: string, num: string): VTagged<Schema, FunctionApp<Ext>> => `RIGHT(${hLit(value)}, ${hLit(num)})` as VTagged<Schema, FunctionApp<Ext>>,
const rightPad = <Schema, Ext extends Extension = NoExtension>(value: string, length: string, pad: string): VTagged<Schema, FunctionApp<Ext>> => `RPAD(${hLit(value)}, ${hLit(length)}, ${hLit(pad)})` as VTagged<Schema, FunctionApp<Ext>>,
const rightTrim = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `RTRIM(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const space = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `RTRIM(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const stingCompare = <Schema, Ext extends Extension = NoExtension>(val1: string, val2: string): VTagged<Schema, FunctionApp<Ext>> => `STRCMP(${hLit(val1)}, ${hLit(val2)})` as VTagged<Schema, FunctionApp<Ext>>,
const subString = <Schema, Ext extends Extension = NoExtension>(value: string, pos: string, length?: string): VTagged<Schema, FunctionApp<Ext>> => `SUBSTRING(${hLit(value)}, ${hLit(pos)}, ${hLit(length)})` as VTagged<Schema, FunctionApp<Ext>>,
const substringIndex = <Schema, Ext extends Extension = NoExtension>(value: string, delim: string, num: string): VTagged<Schema, FunctionApp<Ext>> => (
const const `SUBSTRING_INDEX(${hLit(value)}, ${hLit(delim)}, ${hLit(num)})` as VTagged<Schema, FunctionApp<Ext>>
const ),
const trim = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `TRIM(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const upper = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `UPPER(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,

const abs = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `ABS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const acos = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `ACOS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const asin = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `ASIN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const atan = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `ATAN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const atan2 = <Schema, Ext extends Extension = NoExtension>(v1: string, v2: string): VTagged<Schema, FunctionApp<Ext>> => `ATAN2(${hLit(v1)}, ${hLit(v2)})` as VTagged<Schema, FunctionApp<Ext>>,
const avg = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `AVG(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const ceiling = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `CEILING(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const cos = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `COS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const cot = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `COT(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const count = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `COUNT(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const degrees = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DEGREES(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const exp = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `EXP(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const floor = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `FLOOR(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const greatest = <Schema, Ext extends Extension = NoExtension>(...values: Array<string>): VTagged<Schema, FunctionApp<Ext>> => `GREATEST(${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>,
const least = <Schema, Ext extends Extension = NoExtension>(...values: Array<string>): VTagged<Schema, FunctionApp<Ext>> => `LEAST(${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>,
const ln = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const log = <Schema, Ext extends Extension = NoExtension>(value: string, num?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const num ? `LOG(${hLit(value)}, ${hLit(num)})` : `LOG(${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,
const log10 = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LOG10(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const log2 = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LOG2(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const max = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MAX(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const min = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MIN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const mod = <Schema, Ext extends Extension = NoExtension>(n: string, m: string): VTagged<Schema, FunctionApp<Ext>> => `MOD(${hLit(n)}, ${hLit(m)})` as VTagged<Schema, FunctionApp<Ext>>,
const pi = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `PI()` as VTagged<Schema, FunctionApp<Ext>>,
const power = <Schema, Ext extends Extension = NoExtension>(n: string, m: string): VTagged<Schema, FunctionApp<Ext>> => `POWER(${hLit(n)}, ${hLit(m)})` as VTagged<Schema, FunctionApp<Ext>>,
const radians = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `RADIANS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const rand = <Schema, Ext extends Extension = NoExtension>(value?: string): VTagged<Schema, FunctionApp<Ext>> => (value ? `RAND(${hLit(value)})` : `RAND()`) as VTagged<Schema, FunctionApp<Ext>>,
const round = <Schema, Ext extends Extension = NoExtension>(value: string, places?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const places ? `ROUND(${hLit(value)})` : `ROUND(${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,
const sign = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SIGN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const sin = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SIN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const sqrt = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SQRT(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const sum = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SUM(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const tan = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `TAN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const truncate = <Schema, Ext extends Extension = NoExtension>(value: string, places: string): VTagged<Schema, FunctionApp<Ext>> => `TRUNCATE(${hLit(value)}, ${hLit(places)})` as VTagged<Schema, FunctionApp<Ext>>,

const addDate = <Schema, Ext extends Extension = NoExtension>(value: string, days?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const (days ? `ADDDATE(${hLit(value)}, ${hLit(days)})` : `ADDDATE(${hLit(value)})`) as VTagged<Schema, FunctionApp<Ext>>
const ),
const addTime = <Schema, Ext extends Extension = NoExtension>(value: string, adjust: string): VTagged<Schema, FunctionApp<Ext>> => `ADDTIME(${hLit(value)}, ${hLit(adjust)})` as VTagged<Schema, FunctionApp<Ext>>,
const currentDate = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `CURRENT_DATE()` as VTagged<Schema, FunctionApp<Ext>>,
const currentTime = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `CURRENT_TIME()` as VTagged<Schema, FunctionApp<Ext>>,
const currentTimestamp = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `CURRENT_TIMESTAMP()` as VTagged<Schema, FunctionApp<Ext>>,
const date = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DATE(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const dateFormat = <Schema, Ext extends Extension = NoExtension>(value: string, mask: string): VTagged<Schema, FunctionApp<Ext>> => `DATE_FORMAT(${hLit(value)}, ${hLit(mask)})` as VTagged<Schema, FunctionApp<Ext>>,
const dateSub = <Schema, Ext extends Extension = NoExtension>(value: string, adjust: string): VTagged<Schema, FunctionApp<Ext>> => `DATE_SUB(${hLit(value)}, ${hLit(adjust)})` as VTagged<Schema, FunctionApp<Ext>>,
const dateDiff = <Schema, Ext extends Extension = NoExtension>(val1: string, val2: string): VTagged<Schema, FunctionApp<Ext>> => `DATE_DIFF(${hLit(val1)}, ${hLit(val2)})` as VTagged<Schema, FunctionApp<Ext>>,
const day = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DAY(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const dayName = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DAYNAME(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const dayOfMonth = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DAYOFMONTH(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const dayOfWeek = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DAYOFWEEK(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const dayOfYear = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `DAYOFYEAR(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const extract = <Schema, Ext extends Extension = NoExtension>(unit: string, value: string): VTagged<Schema, FunctionApp<Ext>> => `EXTRACT(${hLit(unit)} FROM ${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const fromDays = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `FROM_DAYS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const hour = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `HOUR(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const lastDay = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `LAST_DAY(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const localTime = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `LOCALTIME()` as VTagged<Schema, FunctionApp<Ext>>,
const localTimestamp = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `LOCALTIMESTAMP()` as VTagged<Schema, FunctionApp<Ext>>,
const makeDate = <Schema, Ext extends Extension = NoExtension>(year: string, day: string): VTagged<Schema, FunctionApp<Ext>> => `MAKEDATE(${hLit(year)}, ${hLit(day)})` as VTagged<Schema, FunctionApp<Ext>>,
const makeTime = <Schema, Ext extends Extension = NoExtension>(hour: string, minute: string, second: string): VTagged<Schema, FunctionApp<Ext>> => `MAKETIME(${hLit(hour)}, ${hLit(minute)}, ${hLit(second)})` as VTagged<Schema, FunctionApp<Ext>>,
const microsecond = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MICROSECOND(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const minute = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MINUTE(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const month = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MONTH(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const monthName = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MONTHNAME(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const now = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `NOW()` as VTagged<Schema, FunctionApp<Ext>>,
const periodAdd = <Schema, Ext extends Extension = NoExtension>(value: string, num: string): VTagged<Schema, FunctionApp<Ext>> => `PERIOD_ADD(${hLit(value)}, ${hLit(num)}` as VTagged<Schema, FunctionApp<Ext>>,
const periodDiff = <Schema, Ext extends Extension = NoExtension>(val1: string, val2: string): VTagged<Schema, FunctionApp<Ext>> => `PERIOD_DIFF(${hLit(val1)}, ${hLit(val2)})` as VTagged<Schema, FunctionApp<Ext>>,
const quarter = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `QUARTER(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const secToTime = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SEC_TO_TIME(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const second = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `SECOND(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const strToDate = <Schema, Ext extends Extension = NoExtension>(value: string, mask: string): VTagged<Schema, FunctionApp<Ext>> => `STR_TO_DATE(${hLit(value)}, ${hLit(mask)})` as VTagged<Schema, FunctionApp<Ext>>,
const subDate = <Schema, Ext extends Extension = NoExtension>(value: string, days: string): VTagged<Schema, FunctionApp<Ext>> => `SUBDATE(${hLit(value)}, ${hLit(days)})` as VTagged<Schema, FunctionApp<Ext>>,
const subTime = <Schema, Ext extends Extension = NoExtension>(value: string, adjust: string): VTagged<Schema, FunctionApp<Ext>> => `SUBTIME(${hLit(value)}, ${hLit(adjust)})` as VTagged<Schema, FunctionApp<Ext>>,
const sysDate = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `SYSDATE()` as VTagged<Schema, FunctionApp<Ext>>,
const time = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `TIME(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const timeFormat = <Schema, Ext extends Extension = NoExtension>(value: string, mask: string): VTagged<Schema, FunctionApp<Ext>> => `TIME_FORMAT(${hLit(value)}, ${hLit(mask)})` as VTagged<Schema, FunctionApp<Ext>>,
const timeToSec = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `TIME_TO_SEC(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const timeDiff = <Schema, Ext extends Extension = NoExtension>(val1: string, val2: string): VTagged<Schema, FunctionApp<Ext>> => `TIMEDIFF(${hLit(val1)}, ${hLit(val2)})` as VTagged<Schema, FunctionApp<Ext>>,
const timestamp = <Schema, Ext extends Extension = NoExtension>(value: string, adjust?: string): VTagged<Schema, FunctionApp<Ext>> => `FUNCTION(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const toDays = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `TO_DAYS(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const week = <Schema, Ext extends Extension = NoExtension>(value: string, mode?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const mode ? `WEEK(${hLit(value)}, ${hLit(mode)})` : `WEEK(${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,
const weekDay = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `WEEKDAY(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const weekOfYear = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `WEEKOFYEAR(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const year = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `YEAR(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const yearWeek = <Schema, Ext extends Extension = NoExtension>(value: string, mode?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const mode ? `YEARWEEK(${hLit(value)}, ${hLit(mode)})` : `YEARWEEK(${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,

const bin = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `BIN(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const binary = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `BINARY ${hLit(value)}` as VTagged<Schema, FunctionApp<Ext>>,
const cast = <Schema, Ext extends Extension = NoExtension>(value: string, typ: string): VTagged<Schema, FunctionApp<Ext>> => `CAST(${hLit(value)} AS ${hLit(typ)})` as VTagged<Schema, FunctionApp<Ext>>,
const coalesce = <Schema, Ext extends Extension = NoExtension>(...values: Array<string>): VTagged<Schema, FunctionApp<Ext>> => `COALESCE(${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>,
const connectionId = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `CONNECTION_ID()` as VTagged<Schema, FunctionApp<Ext>>,
const conv = <Schema, Ext extends Extension = NoExtension>(value: string, frm: string, to: string): VTagged<Schema, FunctionApp<Ext>> => `CONV(${hLit(value)}, ${hLit(frm)}, ${hLit(to)})` as VTagged<Schema, FunctionApp<Ext>>,
const convert = <Schema, Ext extends Extension = NoExtension>(value: string, typ: string): VTagged<Schema, FunctionApp<Ext>> => `CONVERT(${hLit(value)}, ${hLit(typ)})` as VTagged<Schema, FunctionApp<Ext>>,
const currentUser = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `CURRENT_USER()` as VTagged<Schema, FunctionApp<Ext>>,
const database = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `DATABASE()` as VTagged<Schema, FunctionApp<Ext>>,
const if = <Schema, Ext extends Extension = NoExtension>(cond: string, ifTrue?: string, ifFalse?: string): VTagged<Schema, FunctionApp<Ext>> => {
const const const values = [cond];
const const if (ifTrue) {
const const const values.push(ifTrue);
const const }
const const if (ifFalse) {
const const const values.push(ifFalse);
const const }
const const return `IF(${values.map(hLit).join(', ')})` as VTagged<Schema, FunctionApp<Ext>>;
const },
const ifNull = <Schema, Ext extends Extension = NoExtension>(value: string, fallback: string): VTagged<Schema, FunctionApp<Ext>> => `IFNULL(${hLit(value)}, ${hLit(fallback)})` as VTagged<Schema, FunctionApp<Ext>>,
const isNull = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `ISNULL(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const lastInsertId = <Schema, Ext extends Extension = NoExtension>(value?: string): VTagged<Schema, FunctionApp<Ext>> => (value ? `LAST_INSERT_ID(${hLit(value)})` : `LAST_INSERT_ID()`) as VTagged<Schema, FunctionApp<Ext>>,
const nullIf = <Schema, Ext extends Extension = NoExtension>(val1: string, val2: string): VTagged<Schema, FunctionApp<Ext>> => `NULLIF(${hLit(val1)}, ${hLit(val2)})` as VTagged<Schema, FunctionApp<Ext>>,
const sessionUser = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `SESSION_USER()` as VTagged<Schema, FunctionApp<Ext>>,
const systemUser = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `SYSTEM_USER()` as VTagged<Schema, FunctionApp<Ext>>,
const user = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `USER()` as VTagged<Schema, FunctionApp<Ext>>,
const version = <Schema, Ext extends Extension = NoExtension>(): VTagged<Schema, FunctionApp<Ext>> => `VERSION()` as VTagged<Schema, FunctionApp<Ext>>,

const encrypt = <Schema, Ext extends Extension = NoExtension>(value: string, salt?: string): VTagged<Schema, FunctionApp<Ext>> => (
const const salt ? `ENCRYPT(${hLit(value)}, ${hLit(salt)})` : `ENCRYPT(${hLit(value)})`
const ) as VTagged<Schema, FunctionApp<Ext>>,
const md5 = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `MD5(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const oldPassword = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `OLD_PASSWORD(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
const password = <Schema, Ext extends Extension = NoExtension>(value: string): VTagged<Schema, FunctionApp<Ext>> => `PASSWORD(${hLit(value)})` as VTagged<Schema, FunctionApp<Ext>>,
};
*/
