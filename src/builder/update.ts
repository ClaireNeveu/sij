import CallableInstance from 'callable-instance';
import { lens } from 'lens.ts';

import { Expr, Ident, Lit } from '../ast/expr';
import {
    DefaultValue,
    Update,
    ValuesConstructor,
    ValuesQuery,
} from '../ast/statement';
import { Extension, NoExtension } from '../ast/util';
import { TypedAst, Functions, ast } from './functions';
import {
    BuilderExtension,
    NoBuilderExtension,
    WithAlias,
    QualifiedTable,
    makeLit,
    StringKeys,
} from './util';

class UpdateBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> extends CallableInstance<Array<never>, unknown> {
    
    constructor(readonly _statement: Update<Ext>, readonly fn: Functions<Schema, Table, Ext>) {
        super('apply');
    }

    apply<T>(fn: (arg: UpdateBuilder<Schema, Table, Return, Ext>) => T): T {
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

    // sql.update('my_table').set('col', value)
    // sql.update('my_table').set({
    //   col: value,
    //   col2: value2,
    // })

    /**
     * Set has two forms `.set('col', value)` and `.set({ col1: value, col2: value2 })`
     */
    set<Column extends keyof Table>(
        column: Column,
        value: Table[Column] | DefaultValue | TypedAst<Schema, Table[Column], Ext>,
    ): UpdateBuilder<Schema, Table, Return, Ext>;
    set(
        updates: { [Key in StringKeys<Table>]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Ext> }
    ): UpdateBuilder<Schema, Table, Return, Ext>;
    set<Column extends StringKeys<Table>>(
        arg1: Column | { [Key in StringKeys<Table>]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Ext> },
        arg2?: Table[Column] | DefaultValue | TypedAst<Schema, Table[Column], Ext>,
    ): UpdateBuilder<Schema, Table, Return, Ext> {
        if (arg2 === undefined) {
            const updates = arg1 as { [Key in keyof Table]?: Table[Key] | DefaultValue | TypedAst<Schema, Table[Key], Ext> };
            const assignments: Array<[Ident, Expr<Ext> | DefaultValue]> = Object.keys(updates).map(key => {
                const column = key as StringKeys<Table>;
                const value = (updates as any)[key] as Table[Column] | DefaultValue | TypedAst<Schema, Table[Column], Ext>;
                const expr = (
                    typeof value === 'object' && '_tag' in value
                        ? value
                        : makeLit(value as any)
                ) as Expr<Ext> | DefaultValue;
                return [Ident(column), expr];
            });
            return new UpdateBuilder<Schema, Table, Return, Ext>(
                lens<Update<Ext>>().assignments.set(old => [...old, ...assignments])(this._statement),
                this.fn,
            );
        }
        const column = arg1 as Column;
        const value = arg2 as Table[Column] | DefaultValue | TypedAst<Schema, Table[Column], Ext>;
        const expr = (typeof value === 'string' ? Ident(value) : value) as Expr<Ext> | DefaultValue;
        return new UpdateBuilder<Schema, Table, Return, Ext>(
            lens<Update<Ext>>().assignments.set(old => [...old, [Ident(column), expr]])(this._statement),
            this.fn,
        );
    }

    /**
     * `WHERE [expr]`
     * @param clause Either an expression that evaluates to a boolean or a
     *        shorthand equality object mapping columns to values.
     */
    where(clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<Ext>>) {
        const expr: Expr<Ext> = (() => {
            if (typeof clause === 'object' && !('ast' in clause)) {
                return Object.keys(clause).map(k => {
                    const val: any = ((clause as any)[k]) as any
                    return this.fn.eq((k as any), ast<Schema, any, Expr<Ext>>(makeLit(val)))
                }).reduce((acc, val) => this.fn.and(acc, val)).ast;
            }
            return clause.ast;
        })();
        const updateWhere = (old: Expr<Ext> | null): Expr<Ext> => {
            if (old === null) {
                return expr;
            }
            return this.fn.and(
                ast<Schema, boolean, Expr<Ext>>(old),
                ast<Schema, boolean, Expr<Ext>>(expr)
            ).ast;
        };
        return new UpdateBuilder<Schema, Table, Return, Ext>(
            lens<Update<Ext>>().where.set(e => updateWhere(e))(this._statement),
            this.fn
        );
    }
}
// Merges with above class to provide calling as a function
interface UpdateBuilder<
    Schema,
    Table,
    Return,
    Ext extends BuilderExtension,
> {
    <T>(fn: (arg: UpdateBuilder<Schema, Table, Return, Ext>) => T): T
}

export {
    UpdateBuilder,
};
