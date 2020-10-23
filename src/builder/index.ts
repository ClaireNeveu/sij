import { Expr, Ident, Lit } from '../ast/expr';
import {
    Query,
    Select,
    BasicTable,
    JoinedTable,
} from '../ast/query';
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

class Builder<Schema, Ext extends BuilderExtension> {
    fn: Functions<Schema, {}, Ext>

    constructor() {
        this.fn = new Functions<Schema, {}, Ext>();
    }

    from<TableName extends ((keyof Schema) & string)>(
        table?: TableName
    ): QueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext> {
        const tableAst = (
            table === undefined
                ? null
                : JoinedTable<Ext>({ table: BasicTable(Ident(table)), joins: [] })
        );
        const select = Select<Ext>({
            selections: [],
            from: tableAst,
            where: null,
            groupBy: [],
            having: null,
            extensions: null
        });
        const query = Query<Ext>({
            commonTableExprs: [],
            selection: select,
            unions: [],
            ordering: [],
            limit: null,
            offset: null,
            extensions: null,
        });
        return new QueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext>(query, this.fn);
    }

    insertInto<Table extends ((keyof Schema) & string)>(table: Table) {
    }

    update<Table extends ((keyof Schema) & string)>(table: Table) {
    }

    deleteFrom<Table extends ((keyof Schema) & string)>(table: Table) {
    }

    /**
     * Aliases an expression for use in a select.
     */
    as<Col extends string, T>(name: Col, val: T): WithAlias<Col, T> {
        return {
            alias: name,
            val,
        };
    }

    /**
     * Allows you to pass a raw bit of AST into the query.
     * You must provide the type of this expression.
     */
    ast<Return>(e: Expr<Ext>): TypedAst<Schema, Return, Expr<Ext>>{
        return {
            ast: e
        } as TypedAst<Schema, Return, Expr<Ext>>
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
}

class InsertBuilder<
    Schema,
    Table,
    Tn extends ((keyof Schema) & string),
    Ext extends BuilderExtension,
> {
    values(...vs: Array<{ [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Ext> }>) {
        // This is where reflection would be really nice
        /*
        if (this._statement.values.length === 0) { // Check if this is the first set of passed values
         */
        const columns = new Set();
        vs.forEach(v => {
            Object.keys(v).forEach(k => columns.add(k));
        });
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

export {
    Builder,
    QueryBuilder,
};
