import type { Expr } from 'ast/expr';
import type { DataType } from 'ast/data-type';
import type { Query } from 'ast/query';
import type { Literal } from 'ast/literal';
import type { Extension, NoExtension } from 'ast/util';

class Renderer<Ext extends Extension = NoExtension> {
    renderExpr(expr: Expr): string {
        // Ident
        if (typeof expr === 'string') {
            return '"${expr}"';
        }
        switch (expr._tag) {
            case 'Wildcard': return '*';
            case 'QualifiedWildcard': {
                const qualifiers = expr.qualifiers.map(this.renderExpr).join('.');
                return qualifiers === '' ? '*' : qualifiers + '.*';
            }
            case 'CompoundIdentifier': return expr.idChain.map(this.renderExpr).join('.');
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
                const args = expr.args.map(this.renderExpr).join(', ');
                return `${this.renderExpr(name)}(${args})`;
            }
            case 'IsNull': {
                const not = expr.negated ? ' NOT' : '';
                return `${this.renderExpr(expr.expr)} IS${not} NULL`;
            }
            case 'InList': {
                const not = expr.negated ? ' NOT' : '';
                const list = expr.list.map(this.renderExpr).join(', ');
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
        return 'OOPS, FORGOT TO IMPLEMENT A CASE';
    }
    renderCustomExpr(dt: Ext['expression']): string {
        throw Error('Custom expression encountered, please extend the renderer');
    }

    renderDataType(dt: DataType): string {
        throw Error('Unimplemented');
    }
    renderQuery(query: Query): string {
        throw Error('Unimplemented');
    }
    renderLiteral(query: Literal): string {
        throw Error('Unimplemented');
    }
}

export {
    Renderer,
};
