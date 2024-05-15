import { Ident, IsolationLevel, StringLit, NumLit, Interval } from 'sij-core/ast';
import { Tagged, UnTag, tag } from 'sij-core/util';

type PgUtil =
  | SetConstraints
  | SetRole
  | ResetRole
  | SetSessionAuthorization
  | ResetSessionAuthorization
  | Show
  | StartTransaction
  | Truncate
  | Unlisten
  | Vacuum;

/*
SET [ SESSION | LOCAL ] configuration_parameter { TO | = } { value | 'value' | DEFAULT }
*/
interface SetConfigurationParameter
  extends Tagged<
    'SetConfigurationParameter',
    {
      readonly mode: 'Session' | 'Local';
      readonly param: Ident;
      readonly value: StringLit | Ident | NumLit | Array<StringLit | Ident | NumLit> | 'Default';
    }
  > {}
const SetConfigurationParameter = (args: UnTag<SetConfigurationParameter>): SetConfigurationParameter =>
  tag('SetConfigurationParameter', args);

/*
SET [ SESSION | LOCAL ] TIME ZONE { value | 'value' | LOCAL | DEFAULT }
*/
interface SetTimeZone
  extends Tagged<
    'SetTimeZone',
    {
      readonly mode: 'Session' | 'Local';
      readonly value: StringLit | NumLit | Interval | 'Local' | 'Default';
    }
  > {}
const SetTimeZone = (args: UnTag<SetTimeZone>): SetTimeZone => tag('SetTimeZone', args);

/*
SET CONSTRAINTS { ALL | name [, ...] } { DEFERRED | IMMEDIATE }
*/
interface SetConstraints
  extends Tagged<
    'SetConstraints',
    {
      readonly names: Array<Ident>;
      readonly mode: 'Deferred' | 'Immediate';
    }
  > {}
const SetConstraints = (args: UnTag<SetConstraints>): SetConstraints => tag('SetConstraints', args);

/*
SET [ SESSION | LOCAL ] ROLE role_name
SET [ SESSION | LOCAL ] ROLE NONE
*/
interface SetRole
  extends Tagged<
    'SetRole',
    {
      readonly mode: 'Session' | 'Local' | null;
      readonly name: Ident | 'None';
    }
  > {}
const SetRole = (args: UnTag<SetRole>): SetRole => tag('SetRole', args);

/*
RESET ROLE
*/
interface ResetRole extends Tagged<'ResetRole', {}> {}
const ResetRole = (args: UnTag<ResetRole>): ResetRole => tag('ResetRole', args);

/*
SET [ SESSION | LOCAL ] SESSION AUTHORIZATION user_name
SET [ SESSION | LOCAL ] SESSION AUTHORIZATION DEFAULT
*/
interface SetSessionAuthorization
  extends Tagged<
    'SetSessionAuthorization',
    {
      readonly mode: 'Session' | 'Local' | null;
      readonly username: Ident | 'Default';
    }
  > {}
const SetSessionAuthorization = (args: UnTag<SetSessionAuthorization>): SetSessionAuthorization =>
  tag('SetSessionAuthorization', args);

/*
RESET SESSION AUTHORIZATION
*/
interface ResetSessionAuthorization extends Tagged<'ResetSessionAuthorization', {}> {}
const ResetSessionAuthorization = (args: UnTag<ResetSessionAuthorization>): ResetSessionAuthorization =>
  tag('ResetSessionAuthorization', args);

/* TODO -- in core
SET TRANSACTION transaction_mode [, ...]
SET TRANSACTION SNAPSHOT snapshot_id
SET SESSION CHARACTERISTICS AS TRANSACTION transaction_mode [, ...]

where transaction_mode is one of:

    ISOLATION LEVEL { SERIALIZABLE | REPEATABLE READ | READ COMMITTED | READ UNCOMMITTED }
    READ WRITE | READ ONLY
    [ NOT ] DEFERRABLE
*/

/*
SHOW name
SHOW ALL
*/
interface Show
  extends Tagged<
    'Show',
    {
      readonly name: Ident | null; // null == "SHOW ALL"
    }
  > {}
const Show = (args: UnTag<Show>): Show => tag('Show', args);

/*
START TRANSACTION [ transaction_mode [, ...] ]

where transaction_mode is one of:

    ISOLATION LEVEL { SERIALIZABLE | REPEATABLE READ | READ COMMITTED | READ UNCOMMITTED }
    READ WRITE | READ ONLY
    [ NOT ] DEFERRABLE
*/
interface StartTransaction
  extends Tagged<
    'StartTransaction',
    {
      readonly modes: Array<TransactionMode>;
    }
  > {}
const StartTransaction = (args: UnTag<StartTransaction>): StartTransaction => tag('StartTransaction', args);
type TransactionMode = IsolationLevel | 'ReadWrite' | 'ReadOnly' | 'Deferrable' | 'NotDeferrable';

/*
TRUNCATE [ TABLE ] [ ONLY ] name [ * ] [, ... ]
    [ RESTART IDENTITY | CONTINUE IDENTITY ] [ CASCADE | RESTRICT ]
*/
interface Truncate
  extends Tagged<
    'Truncate',
    {
      readonly only: boolean;
      readonly name: Ident;
      readonly restartIdentity: boolean;
      readonly cascade: boolean;
    }
  > {}

const Truncate = (args: UnTag<Truncate>): Truncate => tag('Truncate', args);
/*
UNLISTEN { channel | * }
*/
interface Unlisten
  extends Tagged<
    'Unlisten',
    {
      readonly channels: Array<Ident>; //empty array == "*";
    }
  > {}
const Unlisten = (args: UnTag<Unlisten>): Unlisten => tag('Unlisten', args);

/*
VACUUM [ ( option [, ...] ) ] [ table_and_columns [, ...] ]
VACUUM [ FULL ] [ FREEZE ] [ VERBOSE ] [ ANALYZE ] [ table_and_columns [, ...] ]

where option can be one of:

    FULL [ boolean ]
    FREEZE [ boolean ]
    VERBOSE [ boolean ]
    ANALYZE [ boolean ]
    DISABLE_PAGE_SKIPPING [ boolean ]
    SKIP_LOCKED [ boolean ]
    INDEX_CLEANUP { AUTO | ON | OFF }
    PROCESS_MAIN [ boolean ]
    PROCESS_TOAST [ boolean ]
    TRUNCATE [ boolean ]
    PARALLEL integer
    SKIP_DATABASE_STATS [ boolean ]
    ONLY_DATABASE_STATS [ boolean ]
    BUFFER_USAGE_LIMIT size

and table_and_columns is:

    table_name [ ( column_name [, ...] ) ]
*/

interface Vacuum
  extends Tagged<
    'Vacuum',
    {
      readonly options: Array<VacuumOption>;
      readonly table: Ident;
      readonly columns: Array<Ident>;
    }
  > {}
const Vacuum = (args: UnTag<Vacuum>): Vacuum => tag('Vacuum', args);

type VacuumOption =
  | 'Full'
  | 'Freeze'
  | 'Verbose'
  | 'Analyze'
  | 'DisablePageSkipping'
  | 'SkipLocked'
  | IndexCleanup
  | 'ProcessMain'
  | 'ProcessToast'
  | 'Truncate'
  | Parallel
  | 'SkipDatabaseStats'
  | 'OnlyDatabaseStats'
  | BufferUsageLimit;

interface IndexCleanup
  extends Tagged<
    'IndexCleanup',
    {
      readonly mode: 'Auto' | 'On' | 'Off';
    }
  > {}
const IndexCleanup = (args: UnTag<IndexCleanup>): IndexCleanup => tag('IndexCleanup', args);

interface Parallel
  extends Tagged<
    'Parallel',
    {
      readonly workers: number;
    }
  > {}
const Parallel = (args: UnTag<Parallel>): Parallel => tag('Parallel', args);

interface BufferUsageLimit
  extends Tagged<
    'BufferUsageLimit',
    {
      readonly size: Size;
    }
  > {}
const BufferUsageLimit = (args: UnTag<BufferUsageLimit>): BufferUsageLimit => tag('BufferUsageLimit', args);

interface Size
  extends Tagged<
    'Size',
    {
      readonly value: number;
      readonly unit: 'B' | 'kB' | 'MB' | 'GB' | 'TB';
    }
  > {}
const Size = (args: UnTag<Size>): Size => tag('Size', args);

export {
  PgUtil,
  SetConstraints,
  SetRole,
  ResetRole,
  SetSessionAuthorization,
  ResetSessionAuthorization,
  Show,
  StartTransaction,
  Truncate,
  Unlisten,
  Vacuum,
};
