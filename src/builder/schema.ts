import CallableInstance from 'callable-instance';
import { BuilderExtension, DataTypeToJs, SijError, TypeTag, TypedAst, makeLit, typeTag } from './util';
import {
  AddDomainConstraint,
  AddTableConstraint,
  AlterColumn,
  AlterDomain,
  AlterTable,
  AlterTableAction,
  AssertionDefinition,
  ColumnConstraintDefinition,
  ColumnDefinition,
  ColumnNotNull,
  ConstraintCheckTime,
  DataType,
  DefaultOption,
  DeletePrivilege,
  DomainAction,
  DomainDefinition,
  DropAssertion,
  DropColumn,
  DropDefault,
  DropDomain,
  DropDomainConstraint,
  DropTable,
  DropTableConstraint,
  DropView,
  Expr,
  Extension,
  GrantStatement,
  Ident,
  InsertPrivilege,
  NullDefault,
  Privilege,
  ReferencePrivilege,
  RevokePrivilege,
  SchemaDefinition,
  SchemaDefinitionStatement,
  SchemaManipulationStatement,
  SelectPrivilege,
  SetDefault,
  TableConstraint,
  TableDefinition,
  UniqueConstraint,
  UpdatePrivilege,
  UsagePrivilege,
  ViewDefinition,
} from '../ast';
import { Functions } from './functions';
import { QueryBuilder } from './query';

type SchemaStatement<Ext extends Extension> = SchemaDefinitionStatement<Ext> | SchemaManipulationStatement<Ext>;

const exhaustive = (n: never): never => n;

/*
sql.schema.table(...).domain(...).view();

ts-toolbelt pipe might be useful here
schema :: ([A, B]) => A & B
schema :: <A1, A2, F1 extends A1 => A2, F2 extends 
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

type SchemaArgs<Ext extends Extension> = {
  catalog?: string;
  authorization?: string;
  characterSet?: string;
};
type TableArgs = {
  local?: boolean;
  temporary?: boolean;
  columns: {
    [C in string]: ColumnArgs<any>;
  };
  constraints?: Array<TableConstraint>;
  onCommit?: 'Delete' | 'Preserve';
};
type ColumnArgs<T extends DataType | string> = {
  type: T; // Data type or domain identifier
  default?: DefaultOption | null;
  constraints?: Array<ConstraintArg> | ConstraintArg;
  collation?: string;
};
type ColumnsToTable<Cs extends { [k: string]: ColumnArgs<any> }> = {
  [K in keyof Cs]: Cs[K] extends ColumnArgs<infer T> ? (T extends DataType ? DataTypeToJs<T> : never) : never;
};
type ViewArgs<Database, Table, Return, Ext extends BuilderExtension> = {
  columns?: Array<string>;
  query: QueryBuilder<Database, Table, Return, Ext>; // TODO can also be a VALUES statement
  check?: 'Cascaded' | 'Local';
};
type GrantArgs =
  | {
      privileges?: Array<PrivilegeArg>;
      on: `TABLE ${string}` | `DOMAIN ${string}` | `COLLATION ${string}`;
      to?: Array<string>;
      withGrantOption?: boolean;
    }
  | {
      privileges?: Array<PrivilegeArg>;
      on: `TABLE ${string}` | `DOMAIN ${string}` | `COLLATION ${string}`;
      public: true;
      withGrantOption?: boolean;
    };
type DomainArgs = {
  type: DataType;
  default?: DefaultOption | null;
  constraints?: Array<AssertionDefinition>;
  collation?: string;
};
type AssertionArgs<Database, Table, Return, Ext extends BuilderExtension> = {
  search: QueryBuilder<Database, Table, Return, Ext>;
  initiallyDeferred: boolean;
  deferrable?: boolean;
};
type RevokeArgs =
  | {
      privileges?: Array<PrivilegeArg>;
      on: `TABLE ${string}` | `DOMAIN ${string}` | `COLLATION ${string}`;
      from?: Array<string>;
      withGrantOption?: boolean;
      behavior: DropBehaviorArg;
    }
  | {
      privileges?: Array<PrivilegeArg>;
      on: `TABLE ${string}` | `DOMAIN ${string}` | `COLLATION ${string}`;
      public: true;
      withGrantOption?: boolean;
      behavior: DropBehaviorArg;
    };

type AlterColumnArgs = {
  default: DefaultOption | null | 'DROP' | 'drop';
};
type DropBehaviorArg = 'cascade' | 'CASCADE' | 'restrict' | 'RESTRICT';

type ConstraintArg =
  | ColumnConstraintDefinition
  | 'NOT NULL'
  | 'not null'
  | 'UNIQUE'
  | 'unique'
  | 'PRIMARY KEY'
  | 'primary key';

type PrivilegeArg =
  | Privilege
  | 'SELECT'
  | 'select'
  | 'DELETE'
  | 'delete'
  | 'INSERT'
  | 'insert'
  | 'UPDATE'
  | 'update'
  | 'REFERENCES'
  | 'references'
  | 'USAGE'
  | 'usage';

/**
 * Builds a SELECT statement.
 */
class SchemaBuilder<Database, Return, Ext extends BuilderExtension> extends CallableInstance<Array<never>, unknown> {
  constructor(
    readonly _statements: Array<SchemaStatement<Ext>>,
    readonly fn: Functions<Database, never, Ext>,
    readonly _AlterTableBuilder: typeof AlterTableBuilder = AlterTableBuilder,
    readonly _AlterDomainBuilder: typeof AlterDomainBuilder = AlterDomainBuilder,
  ) {
    super('apply');
  }

  apply<T>(fn: (arg: SchemaBuilder<Database, Return, Ext>) => T): T {
    return fn(this);
  }

  /**
   * Allows you to insert a literal into a query.
   */
  lit<Return extends number | string | boolean | null>(l: Return): TypedAst<Database, Return, Expr<Ext>> {
    return {
      ast: makeLit(l),
    } as TypedAst<Database, Return, Expr<Ext>>;
  }

  /*
  TODO I need to rewrite how the Schema is represented to account for schemas
  createSchema<N extends string>(
    name: N,
    opts: SchemaArgs<Ext> = {},
  ): SchemaBuilder<Database & { schemae: { [P in N]: null } }, Return, Ext> {
    const def = SchemaDefinition<Ext>({
        name: Ident(name),
        catalog: opts.catalog !== undefined ? Ident(opts.catalog) : null,
        authorization: opts.authorization !== undefined ? Ident(opts.authorization) : null,
        characterSet: opts.characterSet !== undefined ? Ident(opts.characterSet) : null,
        definitions: [],
        extensions: null,
    })
    return new SchemaBuilder<Database & { schemae: { [P in N]: null } }, Return, Ext>(
        [def, ...this._statements],
        this.fn as Functions<Database & { schemae: { [P in N]: null } }, any, Ext>,
      );
  }
  */
  _makeColumn<T extends DataType>(name: string, col: ColumnArgs<T>): ColumnDefinition<Ext> {
    const typ = typeof col.type === 'string' ? Ident(col.type) : col.type;
    const def = col.default === null ? NullDefault : col.default === undefined ? null : col.default;
    const makeConstraint = (con: ConstraintArg) => {
      if (typeof con !== 'string') {
        return con;
      }
      switch (con) {
        case 'not null':
        case 'NOT NULL':
          return ColumnConstraintDefinition({ name: null, constraint: ColumnNotNull, attributes: null });
        case 'unique':
        case 'UNIQUE':
          return ColumnConstraintDefinition({
            name: null,
            constraint: UniqueConstraint({ primaryKey: false, columns: [] }),
            attributes: null,
          });
        case 'primary key':
        case 'PRIMARY KEY':
          return ColumnConstraintDefinition({
            name: null,
            constraint: UniqueConstraint({ primaryKey: true, columns: [] }),
            attributes: null,
          });
      }
    };
    const constraints = (() => {
      if (col.constraints === undefined) {
        return [];
      }
      if (Array.isArray(col.constraints)) {
        return col.constraints.map(makeConstraint);
      }
      return [makeConstraint(col.constraints)];
    })();
    const collation = col.collation === undefined ? null : Ident(col.collation);
    return ColumnDefinition({
      name: Ident(name),
      type: typ,
      default: def,
      constraints,
      collation,
      extensions: null,
    });
  }
  createTable<N extends string, T extends TableArgs>(
    name: N,
    opts: T,
  ): SchemaBuilder<Database & { [P in N]: ColumnsToTable<T['columns']> }, Return, Ext> {
    const mode = opts.local ? 'LocalTemp' : opts.temporary ? 'GlobalTemp' : 'Persistent';
    const columns: Array<ColumnDefinition<Ext>> = Object.keys(opts.columns).map(colName => {
      const col = opts.columns[colName];
      return this._makeColumn(colName, col);
    });
    const def = TableDefinition<Ext>({
      name: Ident(name),
      mode: mode,
      columns: columns,
      constraints: opts.constraints ?? [],
      onCommit: opts.onCommit ?? null,
      extensions: null,
    });
    return new SchemaBuilder<Database & { [P in N]: ColumnsToTable<T['columns']> }, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database & { [P in N]: ColumnsToTable<T['columns']> }, any, Ext>,
    );
  }
  createView<
    N extends string,
    QReturn,
    Table extends keyof Database,
    T extends ViewArgs<Database, Table, QReturn, Ext>,
  >(name: N, opts: T): SchemaBuilder<Database & { [P in N]: QReturn }, Return, Ext> {
    // TODO narrow view table by selected columns
    const def = ViewDefinition({
      name: Ident(name),
      columns: opts.columns !== undefined ? opts.columns.map(Ident) : null,
      query: opts.query._statement,
      checkOption: opts.check !== undefined ? opts.check : null,
    });
    return new SchemaBuilder<Database & { [P in N]: QReturn }, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database & { [P in N]: QReturn }, any, Ext>,
    );
  }
  protected _makePrivilege(p: PrivilegeArg) {
    if (typeof p !== 'string') {
      return p;
    }
    switch (p) {
      case 'delete':
      case 'DELETE':
        return DeletePrivilege;
      case 'insert':
      case 'INSERT':
        return InsertPrivilege({ columns: [] });
      case 'select':
      case 'SELECT':
        return SelectPrivilege;
      case 'references':
      case 'REFERENCES':
        return ReferencePrivilege({ columns: [] });
      case 'update':
      case 'UPDATE':
        return UpdatePrivilege({ columns: [] });
      case 'usage':
      case 'USAGE':
        return UsagePrivilege;
      default:
        return exhaustive(p);
    }
  }
  grant(opts: GrantArgs): SchemaBuilder<Database, Return, Ext> {
    const [objectTypeRaw, objectName] = opts.on.split(' ', 2);
    const objectType: 'Table' | 'Domain' | 'Collation' = (() => {
      switch (objectTypeRaw as 'TABLE' | 'DOMAIN' | 'COLLATION') {
        case 'TABLE':
          return 'Table';
        case 'DOMAIN':
          return 'Domain';
        case 'COLLATION':
          return 'Collation';
      }
    })()!;
    const grantees = 'public' in opts ? null : opts.to!.map(Ident);
    const def = GrantStatement({
      privileges: opts.privileges?.map(this._makePrivilege) ?? null,
      objectName: Ident(objectName),
      objectType: objectType,
      grantees,
      grantOption: opts.withGrantOption === undefined ? false : opts.withGrantOption,
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  createDomain(name: string, opts: DomainArgs): SchemaBuilder<Database, Return, Ext> {
    const def = DomainDefinition({
      name: Ident(name),
      dataType: opts.type,
      default: opts.default !== undefined ? opts.default : null,
      constraints: opts.constraints !== undefined ? opts.constraints : [],
      collation: opts.collation !== undefined ? Ident(opts.collation) : null,
      extensions: null,
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  createAssertion<Table extends keyof Database>(
    name: string,
    opts: AssertionArgs<Database, Table, Return, Ext>,
  ): SchemaBuilder<Database, Return, Ext> {
    const checkTime = ConstraintCheckTime({
      deferrable: opts.deferrable ?? true,
      initiallyDeferred: opts.initiallyDeferred ?? false,
    });
    const def = AssertionDefinition({
      name: Ident(name),
      search: opts.search._statement,
      checkTime,
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  /*
  dropSchema(name: string, opts: DomainArgs): SchemaBuilder<Database, Return, Ext> {
    const def = DomainDefinition({
      name: Ident(name),
      dataType: opts.type,
      default: opts.default !== undefined ? opts.default : null,
      constraints: opts.constraints !== undefined ? opts.constraints : [],
      collation: opts.collation !== undefined ? Ident(opts.collation) : null,
      extensions: null,
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
    */
  _makeBehavior(behavior: DropBehaviorArg) {
    switch (behavior) {
      case 'cascade':
      case 'CASCADE':
        return 'Cascade';
      case 'restrict':
      case 'RESTRICT':
        return 'Restrict';
      default:
        return exhaustive(behavior);
    }
  }
  dropTable<N extends string>(name: N, behavior: DropBehaviorArg): SchemaBuilder<Omit<Database, N>, Return, Ext> {
    const def = DropTable({
      name: Ident(name),
      behavior: this._makeBehavior(behavior),
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  dropView<N extends string>(name: N, behavior: DropBehaviorArg): SchemaBuilder<Omit<Database, N>, Return, Ext> {
    const def = DropView({
      name: Ident(name),
      behavior: this._makeBehavior(behavior),
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  revoke(opts: RevokeArgs): SchemaBuilder<Database, Return, Ext> {
    const [objectTypeRaw, objectName] = opts.on.split(' ', 2);
    const objectType: 'Table' | 'Domain' | 'Collation' = (() => {
      switch (objectTypeRaw as 'TABLE' | 'DOMAIN' | 'COLLATION') {
        case 'TABLE':
          return 'Table';
        case 'DOMAIN':
          return 'Domain';
        case 'COLLATION':
          return 'Collation';
      }
    })()!;
    const grantees = 'public' in opts ? null : opts.from!.map(Ident);
    const def = RevokePrivilege({
      privileges: opts.privileges?.map(this._makePrivilege) ?? null,
      objectName: Ident(objectName),
      objectType: objectType,
      grantees,
      grantOption: opts.withGrantOption === undefined ? false : opts.withGrantOption,
      behavior: this._makeBehavior(opts.behavior),
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  dropDomain(name: string, behavior: DropBehaviorArg): SchemaBuilder<Database, Return, Ext> {
    const def = DropDomain({
      name: Ident(name),
      behavior: this._makeBehavior(behavior),
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  dropAssertion(name: string): SchemaBuilder<Database, Return, Ext> {
    const def = DropAssertion({
      name: Ident(name),
    });
    return new SchemaBuilder<Database, Return, Ext>(
      [...this._statements, def],
      this.fn as Functions<Database, any, Ext>,
    );
  }
  /*
   * AlterTableBuilder<`|`> for single dialects
   * AlterTableBuilder<`|${string}`> for single dialects
   */
  alterTable<ND, N extends keyof Database & keyof ND & string>(
    name: N,
    action: (builder: AlterTableBuilder<N, Database, Return, Ext>) => AlterTableBuilder<N, Database, Return, Ext>,
  ): SchemaBuilder<ND, Return, Ext> {
    const builder = action(new this._AlterTableBuilder(name, [], this, this.fn));
    if (builder._actions.length < 1) {
      throw new SijError(`Invalid ALTER TABLE operation on table "${name}" had no actions.`);
    }
    if (builder._actions.length > 1) {
      throw new SijError(
        `Invalid ALTER TABLE operation on table "${name}" had multiple actions. This is not supported by your dialect.`,
      );
    }
    const def = AlterTable({
      name: Ident(name),
      action: builder._actions[0],
    });
    return new SchemaBuilder<ND, Return, Ext>(
      [...this._statements, def],
      this.fn as unknown as Functions<ND, any, Ext>,
    );
  }
  alterDomain(
    name: string,
    action: (builder: AlterDomainBuilder<Database, Return, Ext>) => AlterDomainBuilder<Database, Return, Ext>,
  ): SchemaBuilder<Database, Return, Ext> {
    const builder = action(new this._AlterDomainBuilder([], this, this.fn));
    if (builder._actions.length < 1) {
      throw new SijError(`Invalid ALTER DOMAIN operation on domain "${name}" had no actions.`);
    }
    if (builder._actions.length > 1) {
      throw new SijError(
        `Invalid ALTER DOMAIN operation on domain "${name}" had multiple actions. This is not supported by your dialect.`,
      );
    }
    const def = AlterDomain({
      name: Ident(name),
      action: builder._actions[0],
    });
    return new SchemaBuilder<Database, Return, Ext>([...this._statements, def], this.fn);
  }

  /**
   * Removes all type information from the builder allowing you to construct whatever you want.
   * Generally the schema language doesn't assume the passed schema is complete so this shouldn't
   * be necessary but it's provided as a safeguard.
   */
  unTyped(): SchemaBuilder<any, any, Ext> {
    return this;
  }

  schemaTag(): TypeTag<Database> {
    return typeTag<Database>();
  }
}

// Merges with above class to provide calling as a function
interface SchemaBuilder<Database, Return, Ext extends BuilderExtension> {
  <T>(fn: (arg: SchemaBuilder<Database, Return, Ext>) => T): T;
}

class AlterTableBuilder<N extends keyof Database & string, Database, Return, Ext extends BuilderExtension> {
  constructor(
    readonly _table: N,
    readonly _actions: Array<AlterTableAction<Ext>>,
    readonly _builder: SchemaBuilder<Database, Return, Ext>,
    readonly fn: Functions<Database, never, Ext>,
  ) {}

  addColumn<Col extends keyof Database[N] & string, T extends DataType>(
    name: Col,
    args: ColumnArgs<T>,
  ): AlterTableBuilder<N, Database & { [P in N]: { [C in Col]: DataTypeToJs<T> } }, Return, Ext> {
    const def = this._builder._makeColumn(name, args);
    return new AlterTableBuilder<N, Database & { [P in N]: { [C in Col]: DataTypeToJs<T> } }, Return, Ext>(
      this._table,
      [...this._actions, def],
      this._builder as any,
      this.fn as any,
    );
  }
  alterColumn<Col extends keyof Database[N] & string>(
    name: Col,
    args: AlterColumnArgs,
  ): AlterTableBuilder<N, Database, Return, Ext> {
    const defDef = (() => {
      if (typeof args.default === 'string') {
        return DropDefault;
      } else if (args.default === null) {
        return SetDefault({ default: NullDefault });
      } else {
        return SetDefault({ default: args.default });
      }
    })();
    const def = AlterColumn({ name: Ident(name), action: defDef });
    return new AlterTableBuilder<N, Database, Return, Ext>(
      this._table,
      [...this._actions, def],
      this._builder as any,
      this.fn as any,
    );
  }
  dropColumn<Col extends keyof Database[N] & string>(
    name: Col,
    behavior: DropBehaviorArg,
  ): AlterTableBuilder<N, Omit<Database, N> & { [P in N]: Omit<Database[N], Col> }, Return, Ext> {
    const def = DropColumn({
      name: Ident(name),
      behavior: this._builder._makeBehavior(behavior),
    });
    return new AlterTableBuilder<N, Omit<Database, N> & { [P in N]: Omit<Database[N], Col> }, Return, Ext>(
      this._table,
      [...this._actions, def],
      this._builder as any,
      this.fn as any,
    );
  }
  addConstraint(constraint: TableConstraint): AlterTableBuilder<N, Database, Return, Ext> {
    const def = AddTableConstraint({ constraint });
    return new AlterTableBuilder<N, Database, Return, Ext>(
      this._table,
      [...this._actions, def],
      this._builder as any,
      this.fn as any,
    );
  }
  dropConstraint(name: string, behavior: DropBehaviorArg): AlterTableBuilder<N, Database, Return, Ext> {
    const def = DropTableConstraint({ name: Ident(name), behavior: this._builder._makeBehavior(behavior) });
    return new AlterTableBuilder<N, Database, Return, Ext>(
      this._table,
      [...this._actions, def],
      this._builder as any,
      this.fn as any,
    );
  }
}

class AlterDomainBuilder<Database, Return, Ext extends BuilderExtension> {
  constructor(
    readonly _actions: Array<DomainAction>,
    readonly _builder: SchemaBuilder<Database, Return, Ext>,
    readonly fn: Functions<Database, never, Ext>,
  ) {}

  setDefault(def: DefaultOption): AlterDomainBuilder<Database, Return, Ext> {
    return new AlterDomainBuilder<Database, Return, Ext>(
      [...this._actions, SetDefault({ default: def })],
      this._builder as any,
      this.fn as any,
    );
  }

  dropDefault(): AlterDomainBuilder<Database, Return, Ext> {
    return new AlterDomainBuilder<Database, Return, Ext>(
      [...this._actions, DropDefault],
      this._builder as any,
      this.fn as any,
    );
  }

  addConstraint(constraint: AssertionDefinition): AlterDomainBuilder<Database, Return, Ext> {
    return new AlterDomainBuilder<Database, Return, Ext>(
      [...this._actions, AddDomainConstraint({ constraint })],
      this._builder as any,
      this.fn as any,
    );
  }

  dropConstraint(name: string): AlterDomainBuilder<Database, Return, Ext> {
    return new AlterDomainBuilder<Database, Return, Ext>(
      [...this._actions, DropDomainConstraint({ name: Ident(name) })],
      this._builder as any,
      this.fn as any,
    );
  }
}

export { SchemaBuilder };
