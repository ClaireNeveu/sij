import { Ident, Lit } from './expr';
import { Tagged, UnTag, tag } from "../util";
type TransactionStatement = SetTransaction | SetConstraintMode | Commit | Rollback;

/*
<set transaction statement> ::=
    SET TRANSACTION <transaction mode> [ { <comma> <transaction mode> }... ]
*/
interface SetTransaction
  extends Tagged<
    'SetTransaction',
    {
      readonly modes: Array<TransactionMode>;
    }
  > {}
const SetTransaction = (args: UnTag<SetTransaction>): SetTransaction => tag('SetTransaction', args);

/*
<transaction mode> ::=
    <isolation level>
    | <transaction access mode>
    | <diagnostics size>
*/
type TransactionMode = IsolationLevel | AccessMode | DiagnosticSize;

/*
<isolation level> ::=
    ISOLATION LEVEL <level of isolation>

<level of isolation> ::=
    READ UNCOMMITTED
    | READ COMMITTED
    | REPEATABLE READ
    | SERIALIZABLE
*/
interface IsolationLevel
  extends Tagged<
    'IsolationLevel',
    {
      readonly level: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    }
  > {}
const IsolationLevel = (args: UnTag<IsolationLevel>): IsolationLevel => tag('IsolationLevel', args);

/*
<transaction access mode> ::=
    READ ONLY
    | READ WRITE
*/
interface AccessMode
  extends Tagged<
    'AccessMode',
    {
      readonly mode: 'ReadOnly' | 'ReadWrite';
    }
  > {}
const AccessMode = (args: UnTag<AccessMode>): AccessMode => tag('AccessMode', args);

/*
<diagnostics size> ::=
    DIAGNOSTICS SIZE <number of conditions>

<number of conditions> ::= <simple value specification>

<simple value specification> ::=
    <parameter name>
    | <embedded variable name>
    | <literal>

<parameter name> ::= <colon> <identifier>

<embedded variable name> ::=
    <colon><host identifier>

<host identifier> ::=
    <Ada host identifier>
    | <C host identifier>
    | <COBOL host identifier>
    | <Fortran host identifier>
    | <MUMPS host identifier>
    | <Pascal host identifier>
    | <PL/I host identifier>
*/
interface DiagnosticSize
  extends Tagged<
    'DiagnosticSize',
    {
      readonly size: Lit | Ident;
    }
  > {}
const DiagnosticSize = (args: UnTag<DiagnosticSize>): DiagnosticSize => tag('DiagnosticSize', args);

/*
<set constraints mode statement> ::=
    SET CONSTRAINTS <constraint name list> { DEFERRED | IMMEDIATE }

<constraint name list> ::=
    ALL
    | <constraint name> [ { <comma> <constraint name> }... ]

<constraint name> ::= <qualified name>
*/
interface SetConstraintMode
  extends Tagged<
    'SetConstraintMode',
    {
      readonly constraints: Array<Ident> | null; // null is ALL, TODO qualify
      readonly deferred: boolean;
    }
  > {}
const SetConstraintMode = (args: UnTag<SetConstraintMode>): SetConstraintMode => tag('SetConstraintMode', args);

/*
<commit statement> ::=
    COMMIT [ WORK ]
*/
interface Commit extends Tagged<'Commit', {}> {}
const Commit = (args: UnTag<Commit>): Commit => tag('Commit', args);

/*
<rollback statement> ::=
    ROLLBACK [ WORK ]

*/
interface Rollback extends Tagged<'Rollback', {}> {}
const Rollback = (args: UnTag<Rollback>): Rollback => tag('Rollback', args);

export {
  TransactionStatement,
  SetTransaction,
  TransactionMode,
  IsolationLevel,
  AccessMode,
  DiagnosticSize,
  SetConstraintMode,
  Commit,
  Rollback,
};
