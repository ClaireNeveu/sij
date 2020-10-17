import { Tagged, UnTag, tag, Extension, NoExtension } from './util';
import type { Query } from './query';
import type { Ident, Expr } from './expr';

type Statement<Ext extends Extension> =
    | SelectStatement<Ext>
    | Insert<Ext>;

interface SelectStatement<Ext extends Extension> extends Tagged<'SelectStatement', {
    readonly query: Query<Ext>,
}> {};
const SelectStatement = <Ext extends Extension>(args: UnTag<SelectStatement<Ext>>): SelectStatement<Ext> => tag('SelectStatement', args);

interface Insert<Ext extends Extension> extends Tagged<'Insert', {
    readonly table: Ident,
    readonly columns: Array<Ident>,
    readonly values: Values<Ext>,
    readonly extensions: Ext['Insert'] | null,
}> {};
const Insert = <Ext extends Extension>(args: UnTag<Insert<Ext>>): Insert<Ext> => tag('Insert', args);

/**
 * `DEFAULT` used in an INSERT statment, e.g. `INSERT INTO some_table (col, col2) VALUES (DEFAULT, 'foo')`
 */
interface DefaultValue extends Tagged<'DefaultValue', {}> {};
const DefaultValue = tag('DefaultValue', {});

type Values<Ext extends Extension> =
    | DefaultValues
    | ValuesConstructor<Ext>
    | ValuesQuery<Ext>;

interface DefaultValues extends Tagged<'DefaultValues', {}> {};
const DefaultValues = tag('DefaultValues', {});

interface ValuesConstructor<Ext extends Extension> extends Tagged<'ValuesConstructor', {
    readonly values: Array<Array<Expr<Ext> | DefaultValue>>
}> {};
const ValuesConstructor = <Ext extends Extension>(
    args: UnTag<ValuesConstructor<Ext>>
): ValuesConstructor<Ext> => tag('ValuesConstructor', args);

interface ValuesQuery<Ext extends Extension> extends Tagged<'ValuesQuery', {
    readonly query: Query<Ext>
}> {};
const ValuesQuery = <Ext extends Extension>(
    args: UnTag<ValuesQuery<Ext>>
): ValuesQuery<Ext> => tag('ValuesQuery', args);

export {
    Statement,
    DefaultValue,
};
