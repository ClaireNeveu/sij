import CallableInstance from "callable-instance";
import { BuilderExtension } from "./util";
import { SchemaDefinitionStatement, SchemaManipulationStatement } from "ast";
import { Extension } from "ast/util";

type SchemaStatement<Ext extends Extension> = SchemaDefinitionStatement<Ext> | SchemaManipulationStatement<Ext>;

/*
sql.schema.table(...).domain(...).view();

schema([
    sql.createTable('myTable', {
        columns: [
            {
                name: 'foo',
                type: sql.type.int,
                default: sql.fn.currentUser
                constraints: 'PRIMARY KEY'
            },
            {
                name: 'bar',
                type: sql.type.int,
                default: sql.lit(4)
                constraints: 'NOT NULL'
            },
            {
                name: 'baz',
                type: sql.type.int,
                default: sql.fn.currentUser
                constraints: sql.constraint.notNull
            },
            {
                name: 'baz2',
                type: sql.type.int,
                default: sql.fn.currentUser
                constraints: sql.constraint.check(sql.from(...)
                collation: "latin1"
            },
            {
                name: 'baz2',
                type: sql.type.int,
                default: sql.fn.currentUser
                constraints: sql.constraint.references('otherTable', {
                    ...
                })
            }
        ]
    })
])

name: Ident;
      readonly type: DataType | Ident; // Data type or domain identifier
      readonly default: DefaultOption;
      readonly constraints: Array<ColumnConstraintDefinition>;
      readonly collation: Ident | null; // TODO qualify

Utility type for converting tuple types to object types
*/

/**
 * Builds a SELECT statement.
 */
class QueryBuilder<Schema, Table, Return, Ext extends BuilderExtension> extends CallableInstance<
  Array<never>,
  unknown
> {
}