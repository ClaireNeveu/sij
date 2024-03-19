import test, { Macro } from 'ava';

import { Builder, QueryBuilder as QB } from '../src/builder';
import { Functions } from '../src/builder/functions';
import {
  MergeInsertions,
  Extend,
  StatementBuilder,
  TypedAst,
  ast,
  makeLit,
  QualifiedTable,
  TableOf,
  UnQualifiedTable,
  WithAlias,
} from '../src/builder/util';
import { Renderer } from '../src/render';

import { isSqlR, isParamsSql } from './_util';
import { TypeBuilder } from '../src/builder/type';
import { Delete, Expr, Ident, Query, Select, SqlBigInt } from '../src/ast';
import { lens } from 'lens.ts';
import { Tagged, UnTag, tag } from '../src/ast/util';

import { InsertBuilder as IB } from '../src/builder/insert';
import { UpdateBuilder as UB } from '../src/builder/update';
import { DeleteBuilder as DB } from '../src/builder/delete';
import { SchemaBuilder as SB } from '../src/builder/schema';
import { TypeBuilder as TB } from '../src/builder/type';
import { ConstraintBuilder as CB } from '../src/builder/constraint';
import { TransactionBuilder } from '../src/builder/transaction';
import { DefaultBuilder as DefB } from '../src/builder/default';

type MySchema = {
  employee: {
    id: number;
    name: string;
    salary: number;
    department_id: number;
  };
  department: {
    id: number;
    budget: number;
  };
};

type Rational = { _tag: 'Rational'; val: string };
type RationalType = { _tag: 'Rational' };
const rationalNumber: Rational = { _tag: 'Rational', val: '5000' };

interface Window
  extends Tagged<
    'Window',
    {
      name: Ident;
      partitionBy: Array<Expr<MyExtension>>;
    }
  > {}
const Window = (args: UnTag<Window>): Window => tag('Window', args);

type MyExtension = Extend<{
  builder: {
    types: {
      numeric: number | bigint | Rational;
    };
  };
  Select: null | {
    window: Window | null;
  };
  Delete: {
    using: Array<Ident>;
  };
}>;

class MyTypeBuilder extends TypeBuilder {
  rational(): RationalType {
    return { _tag: 'Rational' };
  }
}

class MyQueryBuilder<Schema, Table, Return> extends QB<Schema, Table, Return, MyExtension> {
  window<Id extends keyof Table & string, Exp extends Expr<MyExtension>, Col extends Id | Exp>(
    name: string,
    opts: { partitionBy?: Col } = {},
  ) {
    const partitionBy: Array<Expr<MyExtension>> = (() => {
      if (opts.partitionBy === undefined) {
        return [];
      } else if (typeof opts.partitionBy === 'string') {
        return [Ident(opts.partitionBy)];
      } else {
        return [opts.partitionBy];
      }
    })();
    const def = Window({
      name: Ident(name),
      partitionBy,
    });
    return new MyQueryBuilder<Schema, Table, Return>(
      lens<Query<MyExtension>>().selection.extensions.set(os =>
        os === null ? { window: def } : lens<MyExtension['Select']>().window.set(os => def)(os),
      )(this._statement),
      this.fn as any,
    );
  }

  override select<
    Alias extends string,
    ColType,
    Id extends keyof Table & string,
    Col extends Id | '*' | WithAlias<Alias, TypedAst<Schema, ColType, Expr<MyExtension>>>,
  >(
    ...cols: Array<Col>
  ): MyQueryBuilder<Schema, TableOf<Table, Col> & Table, UnQualifiedTable<TableOf<Table, Col>> & Return> {
    return super.select(...cols) as MyQueryBuilder<
      Schema,
      TableOf<Table, Col> & Table,
      UnQualifiedTable<TableOf<Table, Col>> & Return
    >;
  }
}

class MyDeleteBuilder<Schema, Table, Return> extends DB<Schema, Table, Return, MyExtension> {
  using(...tables: Array<string>): MyDeleteBuilder<Schema, Table, Return> {
    const tableIdents = tables.map(Ident);
    return new MyDeleteBuilder<Schema, Table, Return>(
      lens<Delete<MyExtension>>().extensions.set(os =>
        os === null ? { using: tableIdents } : lens<MyExtension['Delete']>().using.set(os => tableIdents)(os),
      )(this._statement),
      this.fn as any,
    );
  }

  override where(
    clause: { [K in keyof Table]?: Table[K] } | TypedAst<Schema, any, Expr<MyExtension>>,
  ): MyDeleteBuilder<Schema, Table, Return> {
    return super.where(clause) as MyDeleteBuilder<Schema, Table, Return>;
  }
}

class MyBuilder<Schema> extends Builder<Schema, MyExtension> {
  override dialect = 'PostgreSQL';
  constructor(
    readonly fn: Functions<Schema, { [P in string]: any }, MyExtension>,
    readonly QueryBuilder: typeof QB = MyQueryBuilder as typeof QB,
    readonly InsertBuilder: typeof IB = IB,
    readonly UpdateBuilder: typeof UB = UB,
    readonly DeleteBuilder: typeof DB = MyDeleteBuilder as typeof DB,
    readonly SchemaBuilder: typeof SB = SB,
    readonly TypeBuilder: typeof TB = TB,
    readonly ConstraintBuilder: typeof CB = CB,
    readonly DefaultBuilder: typeof DefB = DefB,
  ) {
    super(fn);
  }
  override from<TableName extends keyof Schema & string>(
    table?: TableName,
  ): MyQueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}> {
    return super.from(table) as MyQueryBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, {}>;
  }

  override deleteFrom<TableName extends keyof Schema & string>(
    table: TableName,
  ): MyDeleteBuilder<Schema, Schema[TableName] & QualifiedTable<Schema, TableName>, number> {
    return super.deleteFrom(table) as MyDeleteBuilder<
      Schema,
      Schema[TableName] & QualifiedTable<Schema, TableName>,
      number
    >;
  }
}

class MyRenderer extends Renderer {
  override renderSelect(select: Select<MyExtension>): string {
    if (select.extensions === null) {
      return super.renderSelect(select);
    }
    const windowDef: string = (() => {
      const windowDef = select.extensions.window;
      if (windowDef === null) {
        return '';
      }
      let ret = ` WINDOW ${this.renderIdent(windowDef.name)}`;
      if (windowDef?.partitionBy !== null) {
        ret = `${ret} (PARTITION BY ${windowDef?.partitionBy.map(e => this.renderExpr(e)).join(', ')})`;
      }
      return ret;
    })();
    const base = super.renderSelect(select);
    return base + windowDef;
  }
  override _renderDelete(del: Delete<MyExtension>): Array<string> {
    const base = super._renderDelete(del);
    const ret = base.slice(0, 2);
    if (del.extensions !== null && del.extensions.using.length > 0) {
      ret.push('USING');
      ret.push(del.extensions.using.map(i => this.renderIdent(i)).join(', '));
    }
    ret.push(...base.slice(2));
    return ret;
  }
}

const r = new MyRenderer();
const b = new MyBuilder<MySchema>(new Functions<MySchema, {}, MyExtension>());

const isSql = isSqlR(r);

test(
  'extend select',
  isSql,
  b.from('employee').select('*').window('my_window', { partitionBy: 'department_id' }),
  'SELECT * FROM "employee" WINDOW "my_window" (PARTITION BY "department_id")',
);

test(
  'extend delete',
  isSql,
  b.deleteFrom('employee').where({ id: 5 }).using('department'),
  'DELETE FROM "employee" USING "department" WHERE ("id" = 5)',
);
