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
    makeLit
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
