import { Expr, Ident, Lit } from '../ast/expr';
import {
    Query,
    Select,
    BasicTable,
    JoinedTable,
} from '../ast/query';
import {
    Insert,
    Update,
    Delete,
} from '../ast/statement';
import { DefaultValue } from '../ast/statement';
import { Extension, NoExtension, VTagged } from '../ast/util';
import { Functions } from './functions';
import {
    BuilderExtension,
    NoBuilderExtension,
    Extend,
    WithAlias,
    QualifiedTable,
    makeLit,
    TypedAst,
    ast,
} from './util';
import { QueryBuilder as QB } from './query';
import { InsertBuilder as IB } from './insert';
import { UpdateBuilder as UB } from './update';
import { DeleteBuilder as DB } from './delete';

class Builder<Schema, Ext extends BuilderExtension> {
    dialect: string  = 'SQL-92'

    constructor(
        readonly fn: Functions<Schema, {}, Ext>,
        readonly QueryBuilder: typeof QB = QB,
        readonly InsertBuilder: typeof IB = IB,
        readonly UpdateBuilder: typeof UB = UB,
        readonly DeleteBuilder: typeof DB = DB,
    ) {}

    from<TableName extends ((keyof Schema) & string)>(
        table?: TableName
    ): QB<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext> {
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
        return new this.QueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}, Ext>(
            query,
            this.fn as any
        );
    }

    insertInto<TableName extends ((keyof Schema) & string)>(
        table: TableName
    ): IB<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext> {
        const insert = Insert<Ext>({
            table: Ident(table),
            columns: [],
            values: null,
            extensions: null,
        })
        return new this.InsertBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(
            insert,
            this.fn as any
        );
    }

    update<TableName extends ((keyof Schema) & string)>(table: TableName) {
        const update = Update<Ext>({
            table: Ident(table),
            assignments: [],
            where: null,
            extensions: null,
        });
        return new this.UpdateBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(
            update,
            this.fn as any
        );
    }

    deleteFrom<TableName extends ((keyof Schema) & string)>(table: TableName) {
        const del = Delete<Ext>({
            table: Ident(table),
            where: null,
            extensions: null,
        });
        return new this.DeleteBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number, Ext>(
            del,
            this.fn as any
        );
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
    lit<Return extends Ext['builder']['types']['numeric']
        | Ext['builder']['types']['string']
        | Ext['builder']['types']['boolean']
        | Ext['builder']['types']['date']
        | null>(
        l: Return
    ): TypedAst<Schema, Return, Expr<Ext>> {
        return {
            ast: makeLit(l as any)
        } as TypedAst<Schema, Return, Expr<Ext>>
    }
    
}

export {
    Builder,
    Functions,
    QB as QueryBuilder,
    IB as InsertBuilder,
    UB as UpdateBuilder,
    DB as DeleteBuilder,
};
