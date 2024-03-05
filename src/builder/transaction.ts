import {
  AccessMode,
  Commit,
  DiagnosticSize,
  Ident,
  IsolationLevel,
  Lit,
  Literal,
  Rollback,
  SetConstraintMode,
  SetTransaction,
  TransactionMode,
} from '../ast';
import { BuilderExtension } from './util';

const exhaustive = (n: never): never => n;

type TransactionModeArg = TransactionMode | 'read only' | 'READ ONLY' | 'read write' | 'READ WRITE';

type IsolationLevelArg =
  | 'read uncommitted'
  | 'READ UNCOMMITTED'
  | 'read committed'
  | 'READ COMMITTED'
  | 'repeatable read'
  | 'REPEATABLE READ'
  | 'serializable'
  | 'SERIALIZABLE';

class TransactionBuilder<Schema, Ext extends BuilderExtension> {
  setTransaction(modes: Array<TransactionModeArg>): SetTransaction {
    const modes_ = modes.map(mode => {
      if (typeof mode !== 'string') {
        return mode;
      }
      switch (mode) {
        case 'read only':
        case 'READ ONLY':
          return AccessMode({ mode: 'ReadOnly' });
        case 'read write':
        case 'READ WRITE':
          return AccessMode({ mode: 'ReadWrite' });
        default:
          return exhaustive(mode);
      }
    });
    return SetTransaction({
      modes: modes_,
    });
  }
  isolationLevel(level: IsolationLevelArg): IsolationLevel {
    let level_: IsolationLevel['level'];
    switch (level) {
      case 'read uncommitted':
      case 'READ UNCOMMITTED':
        level_ = 'ReadUncommitted';
        break;
      case 'read committed':
      case 'READ COMMITTED':
        level_ = 'ReadCommitted';
        break;
      case 'repeatable read':
      case 'REPEATABLE READ':
        level_ = 'RepeatableRead';
        break;
      case 'serializable':
      case 'SERIALIZABLE':
        level_ = 'Serializable';
        break;
      default:
        level_ = exhaustive(level);
    }
    return IsolationLevel({
      level: level_,
    });
  }
  diagnosticSize(size: string | Lit): DiagnosticSize {
    const size_ = typeof size === 'string' ? Ident(size) : size;
    return DiagnosticSize({ size: size_ });
  }
  setConstraints(
    constraints: Array<string> | 'ALL' | 'all',
    deferred: 'deferred' | 'DEFERRED' | 'immediate' | 'IMMEDIATE',
  ): SetConstraintMode {
    const constraints_ = typeof constraints === 'string' ? null : constraints.map(Ident);
    const def = deferred === 'deferred' || deferred === 'DEFERRED';
    return SetConstraintMode({
      constraints: constraints_,
      deferred: def,
    });
  }
  commit(): Commit {
    return Commit({});
  }
  rollback(): Rollback {
    return Rollback({});
  }
}

export { TransactionBuilder };
