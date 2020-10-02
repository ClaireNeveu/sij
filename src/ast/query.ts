import { Tagged, UnTag, tag, Extension, NoExtension } from './util';
import { Ident, Expr } from './expr';

type Query<Ext extends Extension = NoExtension> = Tagged<'Query', {
    readonly commonTableExprs: Array<CommonTableExpr<Ext>>,
    readonly selection: SetExpr<Ext>,
    readonly ordering: Array<OrderingExpr<Ext>>,
    readonly limit: Expr<Ext> | null,
    readonly offset: Expr<Ext> | null,
    readonly extensions: Ext['query'] | null,
}>;
const Query = <Ext extends Extension = NoExtension>(args: UnTag<Query<Ext>>): Query<Ext> => tag('Query', args);

/**
 * A single Common Table Expression as part of a WITH statement.
 * `tableAlias [(col1, col2, ...)] AS (query)`
 */
type CommonTableExpr<Ext extends Extension = NoExtension> = Tagged<'CommonTableExpr', {
    readonly alias: TableAlias,
    readonly query: Query<Ext>
}>;
const CommonTableExpr = <Ext extends Extension = NoExtension>(
    args: UnTag<CommonTableExpr<Ext>>
): CommonTableExpr<Ext> => tag('CommonTableExpr', args);


/**
 * Alias name for a table and optionally its columns
 * e.g. aliasedName (colAlias1, colAlias2) AS 
 */
type TableAlias<Ext extends Extension = NoExtension> = Tagged<'TableAlias', {
    readonly name: Ident,
    readonly columns: Array<Ident>
}>;
const TableAlias = (args: UnTag<TableAlias>): TableAlias => tag('TableAlias', args);

type OrderingExpr<Ext extends Extension = NoExtension> = Tagged<'OrderingExpr', {
    readonly expr: Expr<Ext>,
    readonly order: 'Asc' | 'Desc' | null,
    readonly nullHandling: 'NullsFirst' | 'NullsLast' | null
}>;
const OrderingExpr = <Ext extends Extension = NoExtension>(
    args: UnTag<OrderingExpr<Ext>>
): OrderingExpr<Ext> => tag('OrderingExpr', args);

type SetExpr<Ext extends Extension = NoExtension> =
    | SetSingleton
    | SetFunction<Ext>;

type SetSingleton = Tagged<'SetSingleton', {
    readonly select: Select,
}>;
const SetSingleton = (select: Select): SetSingleton => tag('SetSingleton', { select });

export interface SetFunction<Ext extends Extension = NoExtension> extends Tagged<'SetFunction', {
    readonly func: 'Union' | 'Except' | 'Intersect',
    readonly all: boolean,
    readonly left: SetExpr,
    readonly right: SetExpr,
}> {};
const SetFunction = <Ext extends Extension = NoExtension>(args: UnTag<SetFunction<Ext>>): SetFunction<Ext> => tag('SetFunction', args);

type Select = {
    readonly selections: Array<Selection>,
    readonly from: Array<Table>,
    readonly where: Expr | null,
    readonly groupBy: Array<Expr>,
    readonly having: Expr | null,
};

type Selection =
    | AnonymousSelection
    | AliasedSelection;

type AnonymousSelection<Ext extends Extension = NoExtension> = Tagged<'AnonymousSelection', {
    readonly selection: Expr<Ext>,
}>;
const AnonymousSelection = <Ext extends Extension = NoExtension>(selection: Expr<Ext>): AnonymousSelection<Ext> => tag('AnonymousSelection', { selection });

/**
 * `foo AS bar`
 */
type AliasedSelection<Ext extends Extension = NoExtension> = Tagged<'AliasedSelection', {
    readonly selection: Expr<Ext>,
    readonly alias: Ident,
}>;
const AliasedSelection = <Ext extends Extension = NoExtension>(args: UnTag<AliasedSelection<Ext>>): AliasedSelection<Ext> => tag('AliasedSelection', args);

export {
    Query,
}

/* Extensions that will be needed
 * LIMIT ALL for Netezza
 * OFFSET FETCH
 * Recursive WITH for postgres and mysql
 */
