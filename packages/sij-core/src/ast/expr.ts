import { DataType } from './data-type';
import { Extension, NoExtension } from './util';
import { Tagged, UnTag, tag } from "../util";
import type { Query } from './query';
import type { Literal } from './literal';
import type { UnaryOperator, BinaryOperator } from './operator';

/**
 * Identifier, e.g. for a table or column
 */
type Ident = { _tag: 'Ident'; name: string };
const Ident = (name: string): Ident => ({ _tag: 'Ident', name });
const identToString = (id: Ident): string => id.name;

type DateTimeField = 'Year' | 'Month' | 'Day' | 'Hour' | 'Minute' | 'Second';

type Expr<Ext extends Extension> =
  | Ident
  | Wildcard
  | Value
  | QualifiedWildcard
  | CompoundIdentifier
  | Between<Ext>
  | BinaryApp<Ext>
  | Case<Ext>
  | Cast<Ext>
  | Collate<Ext>
  | Exists<Ext>
  | Extract<Ext>
  | FunctionApp<Ext>
  | IsNull<Ext>
  | InList<Ext>
  | InSubQuery<Ext>
  | Lit
  | Parenthesized<Ext>
  | SubQuery<Ext>
  | UnaryApp<Ext>
  | ExprExtension<Ext>;

interface Wildcard {
  _tag: 'Wildcard';
}
const Wildcard: Wildcard = { _tag: 'Wildcard' };

interface Value {
  _tag: 'Value';
}
const Value: Value = { _tag: 'Value' };

/**
 * Wildcard with qualifiers, e.g. `table.*` or `db.table.*`.
 */
interface QualifiedWildcard extends Tagged<'QualifiedWildcard', { readonly qualifiers: Array<Ident> }> {}
const QualifiedWildcard = (qualifiers: Array<Ident>): QualifiedWildcard => tag('QualifiedWildcard', { qualifiers });

/**
 * Identifier with qualifiers, e.g. `table.column` or `db.table.col`.
 */
interface CompoundIdentifier extends Tagged<'CompoundIdentifier', { readonly idChain: Array<Ident> }> {}
const CompoundIdentifier = (idChain: Array<Ident>): CompoundIdentifier => tag('CompoundIdentifier', { idChain });

type QualifiedIdent = Ident | CompoundIdentifier;

/**
 * Clause that evaluates to a boolean, e.g. `<expr> [NOT] BETWEEN <low> AND <high>`
 */
interface Between<Ext extends Extension>
  extends Tagged<
    'Between',
    {
      readonly expr: Expr<Ext>;
      readonly negated: boolean;
      readonly low: Expr<Ext>;
      readonly high: Expr<Ext>;
      readonly extensions: Ext['Between'] | null;
    }
  > {}
const Between = <Ext extends Extension>(args: UnTag<Between<Ext>>): Between<Ext> => tag('Between', args);

/**
 * Application of a binary operator, e.g. `1 + 1`
 */
interface BinaryApp<Ext extends Extension>
  extends Tagged<
    'BinaryApp',
    {
      readonly left: Expr<Ext>;
      readonly op: BinaryOperator;
      readonly right: Expr<Ext>;
      readonly extensions: Ext['BinaryApp'] | null;
    }
  > {}
const BinaryApp = <Ext extends Extension>(args: UnTag<BinaryApp<Ext>>): BinaryApp<Ext> => tag('BinaryApp', args);

/**
 * ```
 * CASE [expr] WHEN condition THEN result
 *    [WHEN ...]
 *    [ELSE result]
 * END
 * ```
 */
interface Case<Ext extends Extension>
  extends Tagged<
    'Case',
    {
      readonly expr: Expr<Ext> | null;
      readonly cases: Array<{ readonly condition: Expr<Ext>; readonly result: Expr<Ext> }>;
      readonly elseCase: Expr<Ext> | null;
      readonly extensions: Ext['Case'] | null;
    }
  > {}
const Case = <Ext extends Extension>(args: UnTag<Case<Ext>>): Case<Ext> => tag('Case', args);

/**
 * Type-casting of expressions, e.g. `CAST(expr AS BIGINT)`
 */
interface Cast<Ext extends Extension>
  extends Tagged<
    'Cast',
    {
      readonly expr: Expr<Ext>;
      readonly dataType: DataType;
      readonly extensions: Ext['Cast'] | null;
    }
  > {}
const Cast = <Ext extends Extension>(args: UnTag<Cast<Ext>>): Cast<Ext> => tag('Cast', args);

/**
 * Specification of sorting method. e.g. `col COLLATE "de_DE"
 */
interface Collate<Ext extends Extension>
  extends Tagged<
    'Collate',
    {
      readonly expr: Expr<Ext>;
      readonly collation: CompoundIdentifier;
      readonly extensions: Ext['Collate'] | null;
    }
  > {}
const Collate = <Ext extends Extension>(args: UnTag<Collate<Ext>>): Collate<Ext> => tag('Collate', args);

/**
 * `EXISTS(subQuery)`
 */
interface Exists<Ext extends Extension> extends Tagged<'Exists', { readonly subQuery: Query<Ext> }> {}
const Exists = <Ext extends Extension>(subQuery: Query<Ext>): Exists<Ext> => tag('Exists', { subQuery });

/**
 * `EXTRACT(field FROM source)`
 */
interface Extract<Ext extends Extension>
  extends Tagged<
    'Extract',
    {
      readonly field: DateTimeField;
      readonly source: Expr<Ext>;
      readonly extensions: Ext['Extract'] | null;
    }
  > {}
const Extract = <Ext extends Extension>(args: UnTag<Extract<Ext>>): Extract<Ext> => tag('Extract', args);

/**
 * Application of a function
 */
interface FunctionApp<Ext extends Extension>
  extends Tagged<
    'FunctionApp',
    {
      readonly name: CompoundIdentifier;
      readonly args: Array<Expr<Ext>>;
      readonly extensions: Ext['FunctionApp'] | null;
    }
  > {}
const FunctionApp = <Ext extends Extension>(args: UnTag<FunctionApp<Ext>>): FunctionApp<Ext> =>
  tag('FunctionApp', args);

/**
 * `IS [NOT] NULL`
 */
interface IsNull<Ext extends Extension>
  extends Tagged<
    'IsNull',
    {
      readonly negated: boolean;
      readonly expr: Expr<Ext>;
      readonly extensions: Ext['IsNull'] | null;
    }
  > {}
const IsNull = <Ext extends Extension>(args: UnTag<IsNull<Ext>>): IsNull<Ext> => tag('IsNull', args);

/**
 * `[NOT] IN (...list)`
 */
interface InList<Ext extends Extension>
  extends Tagged<
    'InList',
    {
      readonly negated: boolean;
      readonly expr: Expr<Ext>;
      readonly list: Array<Expr<Ext>>;
      readonly extensions: Ext['InList'] | null;
    }
  > {}
const InList = <Ext extends Extension>(args: UnTag<InList<Ext>>): InList<Ext> => tag('InList', args);

/**
 * `[NOT] IN (subquery)`
 */
interface InSubQuery<Ext extends Extension>
  extends Tagged<
    'InSubQuery',
    {
      readonly negated: boolean;
      readonly expr: Expr<Ext>;
      readonly subQuery: Query<Ext>;
      readonly extensions: Ext['InSubQuery'] | null;
    }
  > {}
const InSubQuery = <Ext extends Extension>(args: UnTag<InSubQuery<Ext>>): InSubQuery<Ext> => tag('InSubQuery', args);

/**
 * Any literal
 */
interface Lit extends Tagged<'Lit', { readonly literal: Literal }> {}
const Lit = (l: Literal): Lit => tag('Lit', { literal: l });

/**
 * A parenthesized expression
 */
interface Parenthesized<Ext extends Extension>
  extends Tagged<
    'Parenthesized',
    {
      readonly expr: Expr<Ext>;
    }
  > {}
const Parenthesized = <Ext extends Extension>(e: Expr<Ext>): Parenthesized<Ext> => tag('Parenthesized', { expr: e });

/**
 * A parenthesized subquery
 */
interface SubQuery<Ext extends Extension> extends Tagged<'SubQuery', { readonly query: Query<Ext> }> {}
const SubQuery = <Ext extends Extension>(query: Query<Ext>): SubQuery<Ext> => tag('SubQuery', { query });

/**
 * Application of a unary operator, e.g. `+1`
 */
interface UnaryApp<Ext extends Extension>
  extends Tagged<
    'UnaryApp',
    {
      readonly op: UnaryOperator;
      readonly expr: Expr<Ext>;
      readonly extensions: Ext['UnaryApp'] | null;
    }
  > {}
const UnaryApp = <Ext extends Extension>(args: UnTag<UnaryApp<Ext>>): UnaryApp<Ext> => tag('UnaryApp', args);

/**
 * Wrapper for any expression extensions.
 */
interface ExprExtension<Ext extends Extension>
  extends Tagged<
    'ExprExtension',
    {
      readonly val: Ext['Expr'];
    }
  > {}
const ExprExtension = <Ext extends Extension>(val: Ext['Expr']): ExprExtension<Ext> => tag('ExprExtension', { val });

export {
  Ident,
  identToString,
  Expr,
  Wildcard,
  Value,
  QualifiedWildcard,
  CompoundIdentifier,
  QualifiedIdent,
  Between,
  BinaryApp,
  Case,
  Cast,
  Collate,
  Exists,
  Extract,
  FunctionApp,
  IsNull,
  InList,
  InSubQuery,
  Lit,
  Parenthesized,
  SubQuery,
  UnaryApp,
  ExprExtension,
};
