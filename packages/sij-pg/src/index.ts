import { ClientConfig, Client, QueryResult, QueryResultRow } from "pg";
import { PgBuilder, PgFunctions, PgInsertBuilder, PgQueryBuilder, PgRenderer, PgSchemaBuilder } from 'sij-dialect-postgresql';
import { QualifiedTable } from 'sij-core/util';
import { PgExtension } from "sij-dialect-postgresql/dist/ast";
import { Statement } from "sij-core/ast";
import { TypeTag } from "sij-core/dist/builder/util";


interface StatementBuilder<R> {
  build(): Statement<PgExtension>
  returnTag(): TypeTag<R>
}

export class PgClient<Schema> extends Client {
    #builder: PgBuilder<Schema>;

    constructor(config?: string | ClientConfig) {
        super(config);
        this.#builder = new PgBuilder(new PgFunctions());
    }
    
    async exec<R>(
        query: (builder: PgBuilder<Schema>) => PgSchemaBuilder<Schema, R>
    ): Promise<void>
    async exec<R>(
        query: (builder: PgBuilder<Schema>) => StatementBuilder<R>
    ): Promise<Array<R>> 
    async exec<R>(
        query: (builder: PgBuilder<Schema>) => StatementBuilder<R> | PgSchemaBuilder<Schema, R>
    ): Promise<any> {
        let statements = query(this.#builder).build();
        if (!Array.isArray(statements)) {
            statements = [statements];
        }
        const queries: Array<[string, Array<any>]> = statements.map(st => {
            const renderer = new PgRenderer({
                paramsMode: true,
            });
            const str: string = renderer.renderStatement(st);
            const params = renderer.params;
            return [str, params];
        });
        if (queries.length === 1) {
            const [rawQuery, params] = queries[0];
            const result = await this.query(rawQuery, params);
            return result.rows;
        } else {
            try {
                await this.query('BEGIN')
                await Promise.all(queries.map(async ([rawQuery, params]) => {
                    const result = await this.query(rawQuery, params);
                    return result.rows;
                }));
                await this.query('COMMIT')
              } catch (e) {
                await this.query('ROLLBACK')
                throw e
              } finally {
                // this.release()
              }
        }
    }
    
    async execFull<R extends QueryResultRow>(
        query: (builder: PgBuilder<Schema>) => PgSchemaBuilder<Schema, R>
    ): Promise<Array<QueryResult<any>>> // TODO figure out correct return type
    async execFull<R extends QueryResultRow>(
        query: (builder: PgBuilder<Schema>) => StatementBuilder<R>
    ): Promise<Array<QueryResult<R>>> 
    async execFull<R extends QueryResultRow>(
        query: (builder: PgBuilder<Schema>) => StatementBuilder<R> | PgSchemaBuilder<Schema, R>
    ): Promise<any> {
        let statements = query(this.#builder).build();
        if (!Array.isArray(statements)) {
            statements = [statements];
        }
        const queries: Array<[string, Array<any>]> = statements.map(st => {
            const renderer = new PgRenderer({
                paramsMode: true,
            });
            const str: string = renderer.renderStatement(st);
            const params = renderer.params;
            return [str, params];
        });
        if (queries.length === 1) {
            const [rawQuery, params] = queries[0];
            const result = await this.query(rawQuery, params);
            return result;
        } else {
            try {
                await this.query('BEGIN')
                const results = await Promise.all(queries.map(async ([rawQuery, params]) => {
                    return await this.query(rawQuery, params);
                }));
                await this.query('COMMIT')
                return results;
              } catch (e) {
                await this.query('ROLLBACK')
                throw e
              } finally {
                // this.release()
              }
        }
    }
}
