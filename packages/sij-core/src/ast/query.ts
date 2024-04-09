import { Extension, NoExtension } from './util';
import { Tagged, UnTag, tag } from '../util';
import { Ident, Expr, QualifiedIdent } from './expr';

interface Query<Ext extends Extension>
  extends Tagged<
    'Query',
    {
      readonly commonTableExprs: Array<CommonTableExpr<Ext>>;
      readonly selection: Select<Ext>;
      readonly unions: Array<SetOp<Ext>>;
      readonly ordering: Array<OrderingExpr<Ext>>;
      readonly limit: Expr<Ext> | null;
      readonly offset: Expr<Ext> | null;
      readonly extensions: Ext['Query'] | null;
    }
  > {}
const Query = <Ext extends Extension>(args: UnTag<Query<Ext>>): Query<Ext> => tag('Query', args);

/**
 * A single Common Table Expression as part of a WITH statement.
 * `tableAlias [(col1, col2, ...)] AS (query)`
 */
interface CommonTableExpr<Ext extends Extension>
  extends Tagged<
    'CommonTableExpr',
    {
      readonly alias: TableAlias<Ext>;
      readonly query: Query<Ext>;
    }
  > {}
const CommonTableExpr = <Ext extends Extension>(args: UnTag<CommonTableExpr<Ext>>): CommonTableExpr<Ext> =>
  tag('CommonTableExpr', args);

/**
 * Alias name for a table and optionally its columns
 * e.g. aliasedName (colAlias1, colAlias2) AS
 */
interface TableAlias<Ext extends Extension>
  extends Tagged<
    'TableAlias',
    {
      readonly name: Ident;
      readonly columns: Array<Ident>;
    }
  > {}
const TableAlias = <Ext extends Extension>(args: UnTag<TableAlias<Ext>>): TableAlias<Ext> => tag('TableAlias', args);

interface OrderingExpr<Ext extends Extension>
  extends Tagged<
    'OrderingExpr',
    {
      readonly expr: Expr<Ext>;
      readonly order: 'ASC' | 'DESC' | null;
      readonly nullHandling: 'NULLS FIRST' | 'NULLS LAST' | null;
    }
  > {}
const OrderingExpr = <Ext extends Extension>(args: UnTag<OrderingExpr<Ext>>): OrderingExpr<Ext> =>
  tag('OrderingExpr', args);

interface SetOp<Ext extends Extension>
  extends Tagged<
    'SetOp',
    {
      readonly func: 'UNION' | 'EXCEPT' | 'INTERSECT';
      readonly all: boolean;
      readonly select: Select<Ext>;
    }
  > {}
const SetOp = <Ext extends Extension>(args: UnTag<SetOp<Ext>>): SetOp<Ext> => tag('SetOp', args);

// TODO: do table names need to be qualified?
/*
<group by clause> ::=
  GROUP BY <grouping column reference list>

<grouping column reference list> ::=
  <grouping column reference> [ { <comma> <grouping column reference> }... ]


<grouping column reference> ::=
  <column reference> [ <collate clause> ]
*/
interface Select<Ext extends Extension>
  extends Tagged<
    'Select',
    {
      readonly selections: Array<Selection<Ext>>;
      readonly from: JoinedTable<Ext> | null;
      readonly where: Expr<Ext> | null;
      readonly groupBy: Array<Expr<Ext>>;
      readonly having: Expr<Ext> | null;
      readonly extensions: Ext['Select'] | null;
    }
  > {}
const Select = <Ext extends Extension>(args: UnTag<Select<Ext>>): Select<Ext> => tag('Select', args);

type Selection<Ext extends Extension> = AnonymousSelection<Ext> | AliasedSelection<Ext>;

interface AnonymousSelection<Ext extends Extension>
  extends Tagged<
    'AnonymousSelection',
    {
      readonly selection: Expr<Ext>;
    }
  > {}
const AnonymousSelection = <Ext extends Extension>(selection: Expr<Ext>): AnonymousSelection<Ext> =>
  tag('AnonymousSelection', { selection });

/**
 * `foo AS bar`
 */
interface AliasedSelection<Ext extends Extension>
  extends Tagged<
    'AliasedSelection',
    {
      readonly selection: Expr<Ext>;
      readonly alias: Ident;
    }
  > {}
const AliasedSelection = <Ext extends Extension>(args: UnTag<AliasedSelection<Ext>>): AliasedSelection<Ext> =>
  tag('AliasedSelection', args);

// TODO aliased tables
interface JoinedTable<Ext extends Extension>
  extends Tagged<
    'JoinedTable',
    {
      readonly table: Table<Ext>;
      readonly joins: Array<Join<Ext>>;
    }
  > {}
const JoinedTable = <Ext extends Extension>(args: UnTag<JoinedTable<Ext>>): JoinedTable<Ext> =>
  tag('JoinedTable', args);

interface Join<Ext extends Extension>
  extends Tagged<
    'Join',
    {
      readonly table: Table<Ext>;
      readonly kind: JoinKind;
      readonly on: Expr<Ext>;
    }
  > {}
const Join = <Ext extends Extension>(args: UnTag<Join<Ext>>): Join<Ext> => tag('Join', args);

type Table<Ext extends Extension> = BasicTable | DerivedTable<Ext> | FunctionTable<Ext> | TableExtension<Ext>;

interface BasicTable
  extends Tagged<
    'BasicTable',
    {
      readonly name: QualifiedIdent;
    }
  > {}
const BasicTable = (name: QualifiedIdent): BasicTable => tag('BasicTable', { name });

interface DerivedTable<Ext extends Extension>
  extends Tagged<
    'DerivedTable',
    {
      readonly subQuery: Query<Ext>;
      readonly alias: Ident;
    }
  > {}
const DerivedTable = <Ext extends Extension>(args: UnTag<DerivedTable<Ext>>): DerivedTable<Ext> =>
  tag('DerivedTable', args);

/**
 * Represents a function that returns a table. This was only introduced in SQL 2003
 * with UNNEST but because joins are such a core part of the builder language
 * This AST node is included in sij-core to avoid excessive method re-defining
 * in the dialects. At least PostgreSQL, MySQL, and MSSQL have table-valued
 * functions even if none of them have the *same* table-valued functions.
 */
interface FunctionTable<Ext extends Extension>
  extends Tagged<
    'FunctionTable',
    {
      readonly func: Expr<Ext>;
      readonly alias: Ident;
    }
  > {}
const FunctionTable = <Ext extends Extension>(args: UnTag<FunctionTable<Ext>>): FunctionTable<Ext> =>
  tag('FunctionTable', args);

interface TableExtension<Ext extends Extension>
  extends Tagged<
    'TableExtension',
    {
      readonly val: Ext['Table'];
    }
  > {}
const TableExtension = <Ext extends Extension>(args: UnTag<TableExtension<Ext>>): TableExtension<Ext> =>
  tag('TableExtension', args);

type JoinKind = 'INNER' | 'LEFT OUTER' | 'RIGHT OUTER' | 'FULL OUTER';

export {
  Query,
  CommonTableExpr,
  TableAlias,
  OrderingExpr,
  SetOp,
  Select,
  Selection,
  AnonymousSelection,
  AliasedSelection,
  JoinedTable,
  Join,
  JoinKind,
  Table,
  BasicTable,
  DerivedTable,
  TableExtension,
};

/* Extensions that will be needed
 * LIMIT ALL for Netezza
 * OFFSET FETCH
 * Recursive WITH for postgres and mysql
 */
