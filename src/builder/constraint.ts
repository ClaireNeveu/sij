import {
  CheckConstraint,
  ColumnConstraintDefinition,
  ColumnNotNull,
  ConstraintCheckTime,
  Ident,
  ReferenceConstraint,
  ReferentialAction,
  UniqueConstraint,
} from '../ast';
import { ConstraintDefinition } from '../ast/schema-definition';
import { QueryBuilder } from './query';
import { BuilderExtension } from './util';

const exhaustive = (n: never): never => n;

type ReferentialActionArg =
  | 'cascade'
  | 'CASCADE'
  | 'set null'
  | 'SET NULL'
  | 'set default'
  | 'SET DEFAULT'
  | 'no action'
  | 'NO ACTION';

class ConstraintBuilder<Schema, Ext extends BuilderExtension> {
  notNull(opts: { name?: string; deferrable?: boolean; initiallyDeferred?: boolean } = {}): ConstraintDefinition<ColumnNotNull> {
    let checkTime;
    if (opts.deferrable === undefined && opts.initiallyDeferred === undefined) {
      checkTime = null;
    } else {
      checkTime = ConstraintCheckTime({
        deferrable: opts.deferrable ?? false,
        initiallyDeferred: opts.initiallyDeferred ?? false,
      });
    }
    return ConstraintDefinition({
      name: opts.name === undefined ? null : Ident(opts.name),
      constraint: ColumnNotNull,
      checkTime,
    });
  }
  unique(
    opts: {
      name?: string;
      deferrable?: boolean;
      initiallyDeferred?: boolean;
      columns?: Array<string>;
      primaryKey?: boolean;
    } = {},
  ): ConstraintDefinition<UniqueConstraint> {
    let checkTime;
    if (opts.deferrable === undefined && opts.initiallyDeferred === undefined) {
      checkTime = null;
    } else {
      checkTime = ConstraintCheckTime({
        deferrable: opts.deferrable ?? false,
        initiallyDeferred: opts.initiallyDeferred ?? false,
      });
    }
    return ConstraintDefinition({
      name: opts.name === undefined ? null : Ident(opts.name),
      constraint: UniqueConstraint({
        columns: opts.columns?.map(Ident) ?? [],
        primaryKey: opts.primaryKey ?? false,
      }),
      checkTime,
    });
  }
  references(opts: {
    table: string;
    columns: Array<string>;
    match?: 'FULL' | 'full' | 'PARTIAL' | 'partial';
    onUpdate?: ReferentialActionArg;
    onDelete?: ReferentialActionArg;
    name?: string;
    deferrable?: boolean;
    initiallyDeferred?: boolean;
  }): ConstraintDefinition<ReferenceConstraint> {
    let checkTime;
    if (opts.deferrable === undefined && opts.initiallyDeferred === undefined) {
      checkTime = null;
    } else {
      checkTime = ConstraintCheckTime({
        deferrable: opts.deferrable ?? false,
        initiallyDeferred: opts.initiallyDeferred ?? false,
      });
    }
    let matchType: ReferenceConstraint['matchType'];
    if (opts.match === 'FULL' || opts.match === 'full') {
      matchType = 'Full';
    } else if (opts.match === 'PARTIAL' || opts.match === 'partial') {
      matchType = 'Partial';
    } else {
      matchType = 'Regular';
    }
    const makeRefAction = (ra: ReferentialActionArg): ReferentialAction => {
      switch (ra) {
        case 'cascade':
        case 'CASCADE':
          return 'Cascade';
        case 'set null':
        case 'SET NULL':
          return 'SetNull';
        case 'set default':
        case 'SET DEFAULT':
          return 'SetDefault';
        case 'no action':
        case 'NO ACTION':
          return 'NoAction';
        default:
          return exhaustive(ra);
      }
    };
    const onUpdate = opts.onUpdate === undefined ? null : makeRefAction(opts.onUpdate);
    const onDelete = opts.onDelete === undefined ? null : makeRefAction(opts.onDelete);
    const reference = ReferenceConstraint({
      table: Ident(opts.table),
      columns: opts.columns.map(Ident),
      matchType,
      onUpdate,
      onDelete,
    });
    return ConstraintDefinition({
      name: opts.name === undefined ? null : Ident(opts.name),
      constraint: reference,
      checkTime,
    });
  }
  check<Table>(
    query: QueryBuilder<Schema, Table, boolean, Ext>,
    opts: {
      name?: string;
      deferrable?: boolean;
      initiallyDeferred?: boolean;
    } = {},
  ): ConstraintDefinition<CheckConstraint> {
    let checkTime;
    if (opts.deferrable === undefined && opts.initiallyDeferred === undefined) {
      checkTime = null;
    } else {
      checkTime = ConstraintCheckTime({
        deferrable: opts.deferrable ?? false,
        initiallyDeferred: opts.initiallyDeferred ?? false,
      });
    }
    const check = CheckConstraint({
      search: query.finish(),
    });
    return ConstraintDefinition({
      name: opts.name === undefined ? null : Ident(opts.name),
      constraint: check,
      checkTime,
    });
  }
}

export { ConstraintBuilder };
