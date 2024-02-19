import type { Expr, Ident } from '../ast/expr';
import type { DataType } from '../ast/data-type';
import type {
    Query,
    Select,
    Table,
} from '../ast/query';
import type { Insert, Statement, Update, Delete, UpdatePositioned, DeletePositioned } from '../ast/statement';
import type { Literal } from '../ast/literal';
import type { Extension, NoExtension } from '../ast/util';
import { CreateSchema, DomainDefinition, NumLit } from 'ast';
import { ConstraintCheckTime, DefaultOption } from 'ast/schema-definition';

const exhaustive = (n: never): void => { };

class Renderer<Ext extends Extension = NoExtension> {
    params: Array<any>
    readonly _paramsMode: boolean
    _placeHolderStyle: '$' | '?'

    constructor(opts: { paramsMode?: boolean, placeHolderStyle?: '$' | '?' } = {}) {
        this.params = [];
        this._paramsMode = opts.paramsMode ?? false;
        this._placeHolderStyle = opts.placeHolderStyle ?? '$';
    }

    renderIdent(ident: Ident): string {
        return `"${ident.name}"`;
    }

    renderPlaceholder(n: number): string {
        return this._placeHolderStyle === '?' ? '?' : '$' + n;
    }

    renderStatement(statement: Statement<any>): string {
        switch (statement._tag) {
            case 'Query': return this.renderQuery(statement);
            case 'Insert': return this.renderInsert(statement);
            case 'Update': return this.renderUpdate(statement);
            case 'Delete': return this.renderDelete(statement);
            case 'UpdatePositioned': return this.renderUpdatePositioned(statement);
            case 'DeletePositioned': return this.renderDeletePositioned(statement);
            case 'CreateSchema': return this.renderCreateSchema(statement);
            case 'TableDefinition': return this.renderTableDefinition(statement);
            case 'ViewDefinition': return this.renderViewDefinition(statement);
            case 'GrantStatement': return this.renderGrantStatement(statement);
            case 'DomainDefinition': return this.renderDomainDefinition(statement);
            case 'AssertionDefinition': return this.renderAssertionDefinition(statement);
        }
        exhaustive(statement);
    }

    renderExpr(expr: Expr): string {
        switch (expr._tag) {
            case 'Ident': return this.renderIdent(expr);
            case 'Wildcard': return '*';
            case 'QualifiedWildcard': {
                const qualifiers = expr.qualifiers.map(e => this.renderExpr(e)).join('.');
                return qualifiers === '' ? '*' : qualifiers + '.*';
            }
            case 'CompoundIdentifier': return expr.idChain.map(e => this.renderExpr(e)).join('.');
            case 'Between': {
                const operand = this.renderExpr(expr.expr);
                const not = expr.negated ? ' NOT' : '';
                const low = this.renderExpr(expr.low);
                const high = this.renderExpr(expr.high);
                return `${operand}${not} BETWEEN ${low} AND ${high}`
            }
            case 'BinaryApp': {
                const left = this.renderExpr(expr.left);
                const right = this.renderExpr(expr.right);
                return `${left} ${expr.op} ${right}`
            }
            case 'Case': {
                const operand = expr.expr === null ? '' : ' ' + this.renderExpr(expr.expr);
                const cases = expr.cases.map(({ condition, result }) => (
                    `WHEN ${this.renderExpr(condition)} THEN ${this.renderExpr(result)}`
                ));
                const else_ = expr.elseCase === null ? '' : 'ELSE ' + this.renderExpr(expr.elseCase) + ' ';
                return `CASE${operand} ${cases.join(' ')} ${else_}END`
            }
            case 'Cast': return `CAST(${this.renderExpr(expr.expr)} AS ${this.renderDataType(expr.dataType)})`;
            case 'Collate': return `${this.renderExpr(expr.expr)} COLLATE ${this.renderExpr(expr.collation)}`;
            case 'Exists': return `EXISTS(${this.renderQuery(expr.subQuery)})`;
            case 'Extract': return `EXTRACT(${expr.field} FROM ${this.renderExpr(expr.source)})`;
            case 'FunctionApp': {
                const args = expr.args.map(e => this.renderExpr(e)).join(', ');
                return `${this.renderExpr(expr.name)}(${args})`;
            }
            case 'IsNull': {
                const not = expr.negated ? ' NOT' : '';
                return `${this.renderExpr(expr.expr)} IS${not} NULL`;
            }
            case 'InList': {
                const not = expr.negated ? ' NOT' : '';
                const list = expr.list.map(e => this.renderExpr(e)).join(', ');
                return `${this.renderExpr(expr.expr)}${not} IN (${list})`;
            }
            case 'InSubQuery': {
                const not = expr.negated ? ' NOT' : '';
                const sub = this.renderQuery(expr.subQuery);
                return `${this.renderExpr(expr.expr)}${not} IN (${sub})`;
            }
            case 'Lit': return this.renderLiteral(expr.literal);
            case 'Parenthesized': return `(${this.renderExpr(expr.expr)})`;
            case 'SubQuery': return `(${this.renderQuery(expr.query)})`;
            case 'UnaryApp': return `${expr.op}${this.renderExpr(expr.expr)}`;
            case 'ExprExtension': return this.renderCustomExpr(expr.val);
        }
        exhaustive(expr);
    }
    renderCustomExpr(dt: Ext['Expr']): string {
        throw Error('Custom expression encountered, please extend the renderer');
    }

    renderDataType(dt: DataType): string {
        throw Error('Unimplemented');
    }
    renderQuery(query: Query): string {
        const ctes = (() => {
            if (query.commonTableExprs.length == 0) {
                return '';
            }
            const subs = query.commonTableExprs.map(cte => {
                const cols = (
                    cte.alias.columns.length === 0
                        ? ''
                        : ` (${cte.alias.columns.map(e => this.renderIdent(e)).join(', ')})`
                );
                return `${this.renderIdent(cte.alias.name)}${cols} AS (${this.renderQuery(cte.query)})`
            });
            return `WITH ${subs.join(', ')} `;
        })();

        const limit = query.limit === null ? '' : ` LIMIT ${this.renderExpr(query.limit)}`;
        const offset = query.offset === null ? '' : ` OFFSET ${this.renderExpr(query.offset)}`;
        const ordering = (() => {
            if (query.ordering.length === 0) {
                return '';
            }
            const orders = query.ordering.map(order => {
                const asc = order.order === null ? '' : ' ' + order.order;
                const nullHandling = order.nullHandling === null ? '' : ' ' + order.nullHandling;
                return `${this.renderExpr(order.expr)}${asc}${nullHandling}`
            });
            return ` ORDER BY ${orders.join(', ')}`;
        })();
        const selection = this.renderSelect(query.selection);
        const unions = (() => {
            if (query.unions.length === 0) {
                return '';
            }
            return ' ' + query.unions.map(u => {
                const all = u.all ? ' ALL' : '';
                return ` ${u.func}${all} ${this.renderSelect(u.select)}`;
            }).join(' ');
        })();

        return `${ctes}${selection}${unions}${ordering}${limit}${offset}`;
    }

    renderSelect(select: Select<any>): string {
        const selections = select.selections.map(s => {
            switch (s._tag) {
                case 'AnonymousSelection': return this.renderExpr(s.selection);
                case 'AliasedSelection':
                    return `${this.renderExpr(s.selection)} AS ${this.renderIdent(s.alias)}`;
            }
        }).join(', ');

        const where = select.where === null ? '' : ' WHERE ' + this.renderExpr(select.where);
        const groupBy = (
            select.groupBy.length === 0
                ? ''
                : ' GROUP BY' + select.groupBy.map(e => this.renderExpr(e)).join(', ')
        );
        const having = (
            select.having === null
                ? ''
                : ' HAVING' + this.renderExpr(select.having)
        );

        const table = (() => {
            if (select.from === null) {
                return '';
            }
            const initTable = this.renderTable(select.from.table);
            const joins = select.from.joins.map(join => (
                ` ${join.kind} JOIN ${this.renderTable(join.table)} ON ${this.renderExpr(join.on)}`
            )).join('');
            return ' FROM ' + initTable + joins;
        })();

        return `SELECT ${selections}${table}${where}${groupBy}${having}`;
    }

    renderTable(table: Table<any>): string | null {
        switch (table._tag) {
            case 'BasicTable': return this.renderIdent(table.name);
            case 'DerivedTable':
                return `(${this.renderQuery(table.subQuery)}) AS ${this.renderIdent(table.alias)}`;
            case 'FunctionTable':
                return `(${this.renderExpr(table.func)}) AS ${this.renderIdent(table.alias)}`;
            case 'TableExtension': return this.renderCustomTable(table.val);
        }
        exhaustive(table);
    }
    renderCustomTable(dt: Ext['Table']): string {
        throw Error('Custom table encountered, please extend the renderer');
    }

    renderLiteral(literal: Literal): string {
        if (this._paramsMode) {
            const val = literal._tag === 'NullLit' ? null : literal.val;
            const l = this.params.push(val);
            return this.renderPlaceholder(l);
        }
        switch (literal._tag) {
            case 'NumLit': {
                const v = literal.val;
                return (typeof v === 'string' ? v : '' + v);
            }
            case 'StringLit': return `'${literal.val}'`;
            case 'BoolLit': return (literal.val ? 'TRUE' : 'FALSE');
            case 'NullLit': return 'NULL';
            case 'DateLit': return `DATE '${literal.val.toISOString()}'`;
            case 'CustomLit': throw new Error('Custom literal encountered, please extend the renderer');
        }
        exhaustive(literal);
    }

    renderInsert(insert: Insert<any>): string {
        const columns = (() => {
            if (insert.columns.length === 0) {
                return '';
            }
            return ` (${insert.columns.map(c => this.renderIdent(c)).join(', ')})`;
        })();
        const values = (() => {
            if (insert.values === null) {
                throw new Error('Invalid Insert. Insert must have VALUES');
            }
            switch (insert.values._tag) {
                case 'DefaultValues': return 'DEFAULT VALUES';
                case 'ValuesConstructor': {
                    const rows = insert.values.values.map(r => {
                        const vals = r.map(c => {
                            switch (c._tag) {
                                case 'DefaultValue': return 'DEFAULT';
                                default: return this.renderExpr(c);
                            }
                        }).join(', ');
                        return `(${vals})`;
                    });
                    return `VALUES ${rows.join(', ')}`;
                }
                case 'ValuesQuery': return this.renderQuery(insert.values.query);
            }
            exhaustive(insert.values);
        })();
        return `INSERT INTO ${this.renderIdent(insert.table)}${columns} ${values}`;
    }

    renderUpdate(update: Update<any>): string {
        const sets = update.assignments.map(([name, value]) => {
            switch (value._tag) {
                case 'DefaultValue': return `${this.renderIdent(name)} = DEFAULT`;
                default: return `${this.renderIdent(name)} = ${this.renderExpr(value)}`;
            }
        }).join(', ');

        const where = update.where === null ? '' : ' WHERE ' + this.renderExpr(update.where);

        return `UPDATE ${this.renderIdent(update.table)} SET ${sets}${where}`;
    }

    renderUpdatePositioned(update: UpdatePositioned<any>): string {
        const sets = update.assignments.map(([name, value]) => {
            switch (value._tag) {
                case 'DefaultValue': return `${this.renderIdent(name)} = DEFAULT`;
                default: return `${this.renderIdent(name)} = ${this.renderExpr(value)}`;
            }
        }).join(', ');

        return `UPDATE ${this.renderIdent(update.table)} SET ${sets} WHERE CURRENT OF ${this.renderIdent(update.cursor)}`;
    }

    renderDelete(del: Delete<any>): string {
        const where = del.where === null ? '' : ' WHERE ' + this.renderExpr(del.where);

        return `DELETE FROM ${this.renderIdent(del.table)}${where}`;
    }

    renderDeletePositioned(del: DeletePositioned<any>): string {

        return `DELETE FROM ${this.renderIdent(del.table)} WHERE CURRENT OF ${this.renderIdent(del.cursor)}`;
    }
    renderCreateSchema(schema: CreateSchema<any>): string {
        const name = (() => {
            let ret = '';
            if (schema.catalog !== null) {
                ret += this.renderIdent(schema.catalog);
                ret += '.';
            }
            if (schema.name !== null) {
                ret += this.renderIdent(schema.name);
                ret += ' ';
            }
            return ret;
        })();
        const auth = schema.authorization !== null ? `AUTHORIZATION ${this.renderIdent(schema.authorization)} ` : '';
        const charSet = schema.characterSet !== null ? (
            `DEFAULT CHARACTER SET ${this.renderIdent(schema.characterSet)} `
        ) : '';
        const defs = schema.definitions.map(def => {
            switch (def._tag) {
                case 'DomainDefinition': return null;
                case 'TableDefinition': return null;
                case 'ViewDefinition': return null;
                case 'GrantStatement': return null;
                case 'AssertionDefinition': return null;
            }
        });

        return `CREATE SCHEMA ${name}${auth}${charSet}[ <schema element>... ]`;
    }
    renderDomainDefinition(def: DomainDefinition<any>): string {
        /*
        <domain definition> ::=
            CREATE DOMAIN <domain name> [ AS ] <data type>
            [ <default clause> ]
            [ <domain constraint>... ]
            [ <collate clause> ]

        <domain constraint> ::=
            [ <constraint name definition> ]
            <check constraint definition> [ <constraint attributes> ]
        */
        const defaultOption = def.default !== null ? ` ${this.renderDefaultOption(def.default)}` : '';
        const constraint = def.constraintExpr !== null ? (
            ` ${this.renderDomainConstraint(def.constraintName, def.constraintExpr, def.constraintAttributes)}`
        ) : '';
        return (
            `CREATE DOMAIN ${this.renderIdent(def.name)} AS ${this.renderDataType(def.dataType)}`
            + defaultOption
            + constraint
        );

    }
    renderDefaultOption(opt: DefaultOption): string {
        const val = (() => {
            switch (opt._tag) {
                case 'Lit': return this.renderLiteral(opt.literal);
                case 'CurrentDateDefault': return 'CURRENT_DATE';
                case 'CurrentTime': {
                    const precision = opt.precision !== null ? ` (${this.renderLiteral(opt.precision)})` : '';
                    return `CURRENT_TIME${precision}`;
                }
                case 'CurrentTimeStamp': {
                    const precision = opt.precision !== null ? ` (${this.renderLiteral(opt.precision)})` : '';
                    return `CURRENT_TIMESTAMP${precision}`;
                }
                case 'UserDefault': return 'USER';
                case 'CurrentUserDefault': return 'CURRENT_USER';
                case 'SessionUserDefault': return 'SESSION_USER';
                case 'SystemUserDefault': return 'SYSTEM_USER';
                case 'NullDefault': return 'NULL';
                default: return exhaustive(opt);
            }
        })()
        return `DEFAULT ${val}`;
    }
    renderDomainConstraint(name: Ident | null, expr: Query, attrs: ConstraintCheckTime | null): string {
        const namePart = name !== null ? `${this.renderIdent(name)} ` : '';
        const def = this.renderQuery(expr);
        const attributes = attrs !== null ? ` ${this.renderConstraintCheckTime(attrs)}` : '';
        return namePart + def + attributes;
    }
    renderConstraintCheckTime(cct: ConstraintCheckTime): string {
       if (cct.deferrable && cct.initiallyDeferred) {
         return 'INITIALLY DEFERRED DEFERRABLE'
       } else if (cct.deferrable) {
        return 'INITIALLY IMMEDIATE DEFERRABLE'
       } else if (cct.initiallyDeferred) {
        return 'INITIALLY DEFERRED NOT DEFERRABLE'
       } else {
        return 'INITIALLY IMMEDIATE NOT DEFERRABLE'
       }
    }
}

export {
    Renderer,
};
