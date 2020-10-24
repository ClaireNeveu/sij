import CallableInstance from 'callable-instance';
import { Expr, Ident, Lit } from '../ast/expr';
import {
    Insert
} from '../ast/statement';
import { DefaultValue } from '../ast/statement';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { TypedAst, Functions, ast } from './functions';
import {
    BuilderExtension,
    NoBuilderExtension,
    WithAlias,
    QualifiedTable,
    makeLit
} from './util';
import { QueryBuilder } from './query';

class InsertBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> extends CallableInstance<Array<never>, unknown> {

    constructor(readonly _statement: Insert<Ext>, readonly fn: Functions<Schema, Table, Ext>) {
        super('apply');
    }

    apply<T>(fn: (arg: InsertBuilder<Schema, Table, Return, Ext>) => T): T {
        return fn(this);
    }

    /**
     * Allows you to insert a literal into the query.
     */
    lit<Return extends number | string | boolean | null>(
        l: Return
    ): TypedAst<Schema, Return, Expr<Ext>>{
        return {
            ast: makeLit(l)
        } as TypedAst<Schema, Return, Expr<Ext>>
    }

    values(
        ...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Ext> }>
    ): InsertBuilder<Schema, Table, Return, Ext> {
        /*
        if (this._statement.values === null) { // Check if this is the first set of passed values
         */
        // This is where reflection would be really nice
        const columns = new Set();
        vs.forEach(v => {
            Object.keys(v).forEach(k => columns.add(k));
        });
        return null as any;
    }
    /**
     * When inserting values SIJ automatically determines the columns
     * of your dataset by traversing all the keys in all the values.
     * In large datasets this can be a performance issue. `values1`
     * only looks at the first value in your dataset to determine
     * the columns.
     */
    values1(...vs: Array<{ [Key in keyof Table]?: Table[Key] }>) {
    }

    /**
     * When inserting values SIJ automatically determines the columns
     * of your dataset by traversing all the keys in all the values.
     * In large datasets this can be a performance issue so you can
     * use `columns` to specify the columns manually and avoid the
     * extra computation.
     */
    columns(...cols: Array<string>) {
    }

    /**
     * Insert the result of a query into the table.
     */
    fromQuery<QReturn>(query: QueryBuilder<Schema, any, QReturn, Ext>) {
    }
}
// Merges with above class to provide calling as a function
interface InsertBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> {
    <T>(fn: (arg: InsertBuilder<Schema, Table, Return, Ext>) => T): T
}

export {
    InsertBuilder,
};
