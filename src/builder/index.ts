import { Expr, Ident, Lit } from '../ast/expr';
import {
    Query,
    Select,
    BasicTable,
    JoinedTable,
} from '../ast/query';
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
import { InsertBuilder } from './insert';

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

    insertInto<TableName extends ((keyof Schema) & string)>(
        table: TableName
    ): InsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext> {
        const insert = Insert<Ext>({
            table: Ident(table),
            columns: [],
            values: null,
            extensions: null,
        })
        return new InsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(insert, this.fn);
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

export {
    Builder,
    QueryBuilder,
};
