import { QualifiedIdent, Ident, DataType, Lit, StringLit, Literal, Expr } from 'sij-core/ast';

import { Tagged, UnTag, tag } from 'sij-core/util';

import type { PgExtension } from '.';

type PgSchemaManipulation =
  | Abort
  | AlterAggregate
  | AlterCollation
  | AlterConversion
  | AlterDatabase
  //  | AlterDefaultPrivileges
  | AlterEventTrigger
  | AlterForeignDataWrapper
  //  | AlterForeignTable
  //  | AlterFunction
  | AlterGroupAddUser
  | AlterGroupRename
  | AlterIndex
  | AlterLanguage
  | AlterLargeObject
  | AlterMaterializedView
  | AlterAllMaterializedView
  | AlterOperator
  | AlterOperatorClass
  | AlterOperatorFamily
  | AlterPolicy
  | AlterProcedure
  | AlterPublication
  | AlterRole
  | AlterRoutine
  | AlterRule
  | AlterSchema
  | AlterSequence
  | AlterServer
  | AlterStatistics
  | AlterSubscription
  | AlterSystem
  // | AlterTable
  | AlterTablespace
  | AlterTextSearchConfiguration
  | AlterTextSearchDictionary
  | AlterTextSearchParser
  | AlterTextSearchTemplate
  | AlterType;

type UserSpec = Ident | 'CurrentRole' | 'CurrentUser' | 'SessionUser';

/*
ABORT [ WORK | TRANSACTION ] [ AND [ NO ] CHAIN ]
*/
interface Abort
  extends Tagged<
    'Abort',
    {
      readonly chain: boolean;
    }
  > {}
const Abort = (args: UnTag<Abort>): Abort => tag('Abort', args);

/*
ALTER AGGREGATE name ( aggregate_signature ) RENAME TO new_name
ALTER AGGREGATE name ( aggregate_signature )
                OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER AGGREGATE name ( aggregate_signature ) SET SCHEMA new_schema

where aggregate_signature is:

* |
[ argmode ] [ argname ] argtype [ , ... ] |
[ [ argmode ] [ argname ] argtype [ , ... ] ] ORDER BY [ argmode ] [ argname ] argtype [ , ... ]
*/
interface AlterAggregate
  extends Tagged<
    'AlterAggregate',
    {
      readonly name: QualifiedIdent;
      readonly args: Array<[boolean, DataType]>; // empty is *
      readonly orderBy: Array<[boolean, DataType]>;
      readonly action: AlterObjectAction;
    }
  > {}
const AlterAggregate = (args: UnTag<AlterAggregate>): AlterAggregate => tag('AlterAggregate', args);

type AlterObjectAction = Rename | OwnerTo | SetSchema;

interface Rename
  extends Tagged<
    'Rename',
    {
      readonly newName: QualifiedIdent;
    }
  > {}
const Rename = (args: UnTag<Rename>): Rename => tag('Rename', args);

interface OwnerTo
  extends Tagged<
    'OwnerTo',
    {
      readonly owner: UserSpec;
    }
  > {}
const OwnerTo = (args: UnTag<OwnerTo>): OwnerTo => tag('OwnerTo', args);

interface SetSchema
  extends Tagged<
    'SetSchema',
    {
      readonly owner: Ident;
    }
  > {}
const SetSchema = (args: UnTag<SetSchema>): SetSchema => tag('SetSchema', args);

/*
ALTER COLLATION name REFRESH VERSION

ALTER COLLATION name RENAME TO new_name
ALTER COLLATION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER COLLATION name SET SCHEMA new_schema
*/
interface AlterCollation
  extends Tagged<
    'AlterCollation',
    {
      readonly name: Ident;
      readonly action: AlterObjectAction;
    }
  > {}
const AlterCollation = (args: UnTag<AlterCollation>): AlterCollation => tag('AlterCollation', args);

/*
ALTER CONVERSION name RENAME TO new_name
ALTER CONVERSION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER CONVERSION name SET SCHEMA new_schema
*/
interface AlterConversion
  extends Tagged<
    'AlterConversion',
    {
      readonly name: Ident;
      readonly action: AlterObjectAction;
    }
  > {}
const AlterConversion = (args: UnTag<AlterConversion>): AlterConversion => tag('AlterConversion', args);

/*
ALTER DATABASE name [ [ WITH ] option [ ... ] ]

where option can be:

    ALLOW_CONNECTIONS allowconn
    CONNECTION LIMIT connlimit
    IS_TEMPLATE istemplate

ALTER DATABASE name RENAME TO new_name

ALTER DATABASE name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }

ALTER DATABASE name SET TABLESPACE new_tablespace

ALTER DATABASE name REFRESH COLLATION VERSION

ALTER DATABASE name SET configuration_parameter { TO | = } { value | DEFAULT }
ALTER DATABASE name SET configuration_parameter FROM CURRENT
ALTER DATABASE name RESET configuration_parameter
ALTER DATABASE name RESET ALL
*/
interface AlterDatabase
  extends Tagged<
    'AlterDatabase',
    {
      readonly name: Ident;
      readonly action: AlterDatabaseAction;
    }
  > {}
const AlterDatabase = (args: UnTag<AlterDatabase>): AlterDatabase => tag('AlterDatabase', args);

type AlterDatabaseAction =
  | ChangeSettings
  | Rename
  | OwnerTo
  | SetTablespace
  | RefreshCollation
  | SetConfig
  | ResetConfig;

/*
ALTER DATABASE name [ [ WITH ] option [ ... ] ]

where option can be:

    ALLOW_CONNECTIONS allowconn
    CONNECTION LIMIT connlimit
    IS_TEMPLATE istemplate
*/
interface ChangeSettings
  extends Tagged<
    'ChangeSettings',
    {
      readonly allowConnections?: boolean;
      readonly connectionLimit?: number;
      readonly isTemplate?: boolean;
    }
  > {}
const ChangeSettings = (args: UnTag<ChangeSettings>): ChangeSettings => tag('ChangeSettings', args);

/*
ALTER DATABASE name SET TABLESPACE new_tablespace
*/
interface SetTablespace
  extends Tagged<
    'SetTablespace',
    {
      readonly name: Ident;
    }
  > {}
const SetTablespace = (args: UnTag<SetTablespace>): SetTablespace => tag('SetTablespace', args);

/*
ALTER DATABASE name REFRESH COLLATION VERSION
*/
interface RefreshCollation extends Tagged<'RefreshCollation', {}> {}
const RefreshCollation: RefreshCollation = tag('RefreshCollation', {});

/*
ALTER DATABASE name SET configuration_parameter { TO | = } { value | DEFAULT }
ALTER DATABASE name SET configuration_parameter FROM CURRENT
*/
interface SetConfig
  extends Tagged<
    'SetConfig',
    {
      readonly name: Ident;
      readonly value: Lit | 'Default' | 'FromCurrent';
    }
  > {}
const SetConfig = (args: UnTag<SetConfig>): SetConfig => tag('SetConfig', args);

/*
ALTER DATABASE name RESET configuration_parameter
ALTER DATABASE name RESET ALL
*/
interface ResetConfig
  extends Tagged<
    'ResetConfig',
    {
      readonly name: Ident | null; // null is RESET ALL
    }
  > {}
const ResetConfig = (args: UnTag<ResetConfig>): ResetConfig => tag('ResetConfig', args);

/*
ALTER DEFAULT PRIVILEGES
    [ FOR { ROLE | USER } target_role [, ...] ]
    [ IN SCHEMA schema_name [, ...] ]
    abbreviated_grant_or_revoke

where abbreviated_grant_or_revoke is one of:

GRANT { { SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER }
    [, ...] | ALL [ PRIVILEGES ] }
    ON TABLES
    TO { [ GROUP ] role_name | PUBLIC } [, ...] [ WITH GRANT OPTION ]

GRANT { { USAGE | SELECT | UPDATE }
    [, ...] | ALL [ PRIVILEGES ] }
    ON SEQUENCES
    TO { [ GROUP ] role_name | PUBLIC } [, ...] [ WITH GRANT OPTION ]

GRANT { EXECUTE | ALL [ PRIVILEGES ] }
    ON { FUNCTIONS | ROUTINES }
    TO { [ GROUP ] role_name | PUBLIC } [, ...] [ WITH GRANT OPTION ]

GRANT { USAGE | ALL [ PRIVILEGES ] }
    ON TYPES
    TO { [ GROUP ] role_name | PUBLIC } [, ...] [ WITH GRANT OPTION ]

GRANT { USAGE | CREATE | ALL [ PRIVILEGES ] }
    ON SCHEMAS
    TO { [ GROUP ] role_name | PUBLIC } [, ...] [ WITH GRANT OPTION ]

REVOKE [ GRANT OPTION FOR ]
    { { SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER }
    [, ...] | ALL [ PRIVILEGES ] }
    ON TABLES
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { USAGE | SELECT | UPDATE }
    [, ...] | ALL [ PRIVILEGES ] }
    ON SEQUENCES
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { EXECUTE | ALL [ PRIVILEGES ] }
    ON { FUNCTIONS | ROUTINES }
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON TYPES
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | CREATE | ALL [ PRIVILEGES ] }
    ON SCHEMAS
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]
*/
interface AlterDefaultPrivileges
  extends Tagged<
    'AlterDefaultPrivileges',
    {
      readonly name: Ident | null; // TODO come back to this after doing grant/revoke
    }
  > {}
const AlterDefaultPrivileges = (args: UnTag<AlterDefaultPrivileges>): AlterDefaultPrivileges =>
  tag('AlterDefaultPrivileges', args);

interface AbbreviatedGrant
  extends Tagged<
    'AbbreviatedGrant',
    {
      readonly name: Ident | null; // TODO come back to this after doing grant/revoke
    }
  > {}
const AbbreviatedGrant = (args: UnTag<AbbreviatedGrant>): AbbreviatedGrant => tag('AbbreviatedGrant', args);

/*
ALTER DOMAIN name
    { SET DEFAULT expression | DROP DEFAULT }
ALTER DOMAIN name
    { SET | DROP } NOT NULL
ALTER DOMAIN name
    ADD domain_constraint [ NOT VALID ]
ALTER DOMAIN name
    DROP CONSTRAINT [ IF EXISTS ] constraint_name [ RESTRICT | CASCADE ]
ALTER DOMAIN name
     RENAME CONSTRAINT constraint_name TO new_constraint_name
ALTER DOMAIN name
    VALIDATE CONSTRAINT constraint_name
ALTER DOMAIN name
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER DOMAIN name
    RENAME TO new_name
ALTER DOMAIN name
    SET SCHEMA new_schema
*/
type PgAlterDomainAction = AlterDomainNotNull;

interface AlterDomainNotNull
  extends Tagged<
    'AlterDomainNotNull',
    {
      readonly set: boolean;
    }
  > {}
const AlterDomainNotNull = (args: UnTag<AlterDomainNotNull>): AlterDomainNotNull => tag('AlterDomainNotNull', args);

interface AlterDomainOwner
  extends Tagged<
    'AlterDomainOwner',
    {
      readonly set: UserSpec;
    }
  > {}
const AlterDomainOwner = (args: UnTag<AlterDomainOwner>): AlterDomainOwner => tag('AlterDomainOwner', args);

interface AlterDomainRename
  extends Tagged<
    'AlterDomainRename',
    {
      readonly set: Ident;
    }
  > {}
const AlterDomainRename = (args: UnTag<AlterDomainRename>): AlterDomainRename => tag('AlterDomainRename', args);

interface AlterDomainSetSchema
  extends Tagged<
    'AlterDomainSetSchema',
    {
      readonly set: Ident;
    }
  > {}
const AlterDomainSetSchema = (args: UnTag<AlterDomainSetSchema>): AlterDomainSetSchema =>
  tag('AlterDomainSetSchema', args);

/*
ALTER EVENT TRIGGER name DISABLE
ALTER EVENT TRIGGER name ENABLE [ REPLICA | ALWAYS ]
ALTER EVENT TRIGGER name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER EVENT TRIGGER name RENAME TO new_name
*/
interface AlterEventTrigger
  extends Tagged<
    'AlterEventTrigger',
    {
      readonly set: Ident;
      readonly action: AlterEventTriggerAction;
    }
  > {}
const AlterEventTrigger = (args: UnTag<AlterEventTrigger>): AlterEventTrigger => tag('AlterEventTrigger', args);

type AlterEventTriggerAction = DisableEventTrigger | EnableEventTrigger | Rename | OwnerTo;

interface DisableEventTrigger extends Tagged<'DisableEventTrigger', {}> {}
const DisableEventTrigger: DisableEventTrigger = tag('DisableEventTrigger', {});

interface EnableEventTrigger
  extends Tagged<
    'EnableEventTrigger',
    {
      readonly mode: 'Replica' | 'Always' | 'Default';
    }
  > {}
const EnableEventTrigger = (args: UnTag<EnableEventTrigger>): EnableEventTrigger => tag('EnableEventTrigger', args);

/*
TODO
ALTER EXTENSION name UPDATE [ TO new_version ]
ALTER EXTENSION name SET SCHEMA new_schema
ALTER EXTENSION name ADD member_object
ALTER EXTENSION name DROP member_object

where member_object is:

  ACCESS METHOD object_name |
  AGGREGATE aggregate_name ( aggregate_signature ) |
  CAST (source_type AS target_type) |
  COLLATION object_name |
  CONVERSION object_name |
  DOMAIN object_name |
  EVENT TRIGGER object_name |
  FOREIGN DATA WRAPPER object_name |
  FOREIGN TABLE object_name |
  FUNCTION function_name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ] |
  MATERIALIZED VIEW object_name |
  OPERATOR operator_name (left_type, right_type) |
  OPERATOR CLASS object_name USING index_method |
  OPERATOR FAMILY object_name USING index_method |
  [ PROCEDURAL ] LANGUAGE object_name |
  PROCEDURE procedure_name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ] |
  ROUTINE routine_name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ] |
  SCHEMA object_name |
  SEQUENCE object_name |
  SERVER object_name |
  TABLE object_name |
  TEXT SEARCH CONFIGURATION object_name |
  TEXT SEARCH DICTIONARY object_name |
  TEXT SEARCH PARSER object_name |
  TEXT SEARCH TEMPLATE object_name |
  TRANSFORM FOR type_name LANGUAGE lang_name |
  TYPE object_name |
  VIEW object_name

and aggregate_signature is:

* |
[ argmode ] [ argname ] argtype [ , ... ] |
[ [ argmode ] [ argname ] argtype [ , ... ] ] ORDER BY [ argmode ] [ argname ] argtype [ , ... ]
*/

/*
ALTER FOREIGN DATA WRAPPER name
    [ HANDLER handler_function | NO HANDLER ]
    [ VALIDATOR validator_function | NO VALIDATOR ]
    [ OPTIONS ( [ ADD | SET | DROP ] option ['value'] [, ... ]) ]
ALTER FOREIGN DATA WRAPPER name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER FOREIGN DATA WRAPPER name RENAME TO new_name
*/
interface AlterForeignDataWrapper
  extends Tagged<
    'AlterForeignDataWrapper',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo | DataWrapperSettings;
    }
  > {}
const AlterForeignDataWrapper = (args: UnTag<AlterForeignDataWrapper>): AlterForeignDataWrapper =>
  tag('AlterForeignDataWrapper', args);

interface DataWrapperSettings
  extends Tagged<
    'DataWrapperSettings',
    {
      readonly handler?: Ident | null;
      readonly validator?: Ident | null;
      readonly options: Array<DataWrapperOption>;
    }
  > {}
const DataWrapperSettings = (args: UnTag<DataWrapperSettings>): DataWrapperSettings => tag('DataWrapperSettings', args);

interface DataWrapperOption
  extends Tagged<
    'DataWrapperOption',
    {
      readonly mode: 'Add' | 'Set' | 'Drop';
      readonly name: Ident;
      readonly value: StringLit;
    }
  > {}
const DataWrapperOption = (args: UnTag<DataWrapperOption>): DataWrapperOption => tag('DataWrapperOption', args);

/*
TODO
ALTER FOREIGN TABLE [ IF EXISTS ] [ ONLY ] name [ * ]
    action [, ... ]
ALTER FOREIGN TABLE [ IF EXISTS ] [ ONLY ] name [ * ]
    RENAME [ COLUMN ] column_name TO new_column_name
ALTER FOREIGN TABLE [ IF EXISTS ] name
    RENAME TO new_name
ALTER FOREIGN TABLE [ IF EXISTS ] name
    SET SCHEMA new_schema

where action is one of:

    ADD [ COLUMN ] column_name data_type [ COLLATE collation ] [ column_constraint [ ... ] ]
    DROP [ COLUMN ] [ IF EXISTS ] column_name [ RESTRICT | CASCADE ]
    ALTER [ COLUMN ] column_name [ SET DATA ] TYPE data_type [ COLLATE collation ]
    ALTER [ COLUMN ] column_name SET DEFAULT expression
    ALTER [ COLUMN ] column_name DROP DEFAULT
    ALTER [ COLUMN ] column_name { SET | DROP } NOT NULL
    ALTER [ COLUMN ] column_name SET STATISTICS integer
    ALTER [ COLUMN ] column_name SET ( attribute_option = value [, ... ] )
    ALTER [ COLUMN ] column_name RESET ( attribute_option [, ... ] )
    ALTER [ COLUMN ] column_name SET STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT }
    ALTER [ COLUMN ] column_name OPTIONS ( [ ADD | SET | DROP ] option ['value'] [, ... ])
    ADD table_constraint [ NOT VALID ]
    VALIDATE CONSTRAINT constraint_name
    DROP CONSTRAINT [ IF EXISTS ]  constraint_name [ RESTRICT | CASCADE ]
    DISABLE TRIGGER [ trigger_name | ALL | USER ]
    ENABLE TRIGGER [ trigger_name | ALL | USER ]
    ENABLE REPLICA TRIGGER trigger_name
    ENABLE ALWAYS TRIGGER trigger_name
    SET WITHOUT OIDS
    INHERIT parent_table
    NO INHERIT parent_table
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
    OPTIONS ( [ ADD | SET | DROP ] option ['value'] [, ... ])
*/

/*
ALTER FUNCTION name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    action [ ... ] [ RESTRICT ]
ALTER FUNCTION name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    RENAME TO new_name
ALTER FUNCTION name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER FUNCTION name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    SET SCHEMA new_schema
ALTER FUNCTION name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    [ NO ] DEPENDS ON EXTENSION extension_name

where action is one of:

    CALLED ON NULL INPUT | RETURNS NULL ON NULL INPUT | STRICT
    IMMUTABLE | STABLE | VOLATILE
    [ NOT ] LEAKPROOF
    [ EXTERNAL ] SECURITY INVOKER | [ EXTERNAL ] SECURITY DEFINER
    PARALLEL { UNSAFE | RESTRICTED | SAFE }
    COST execution_cost
    ROWS result_rows
    SUPPORT support_function
    SET configuration_parameter { TO | = } { value | DEFAULT }
    SET configuration_parameter FROM CURRENT
    RESET configuration_parameter
    RESET ALL
*/

/*
ALTER GROUP role_specification ADD USER user_name [, ... ]
ALTER GROUP role_specification DROP USER user_name [, ... ]

where role_specification can be:

    role_name
  | CURRENT_ROLE
  | CURRENT_USER
  | SESSION_USER
*/
interface AlterGroupAddUser
  extends Tagged<
    'AlterGroupAddUser',
    {
      readonly role: UserSpec;
      readonly drop: boolean;
    }
  > {}
const AlterGroupAddUser = (args: UnTag<AlterGroupAddUser>): AlterGroupAddUser => tag('AlterGroupAddUser', args);

/*
ALTER GROUP group_name RENAME TO new_name
*/
interface AlterGroupRename
  extends Tagged<
    'AlterGroupRename',
    {
      readonly group: Ident;
      readonly new_name: Ident;
    }
  > {}
const AlterGroupRename = (args: UnTag<AlterGroupRename>): AlterGroupRename => tag('AlterGroupRename', args);

/*
ALTER INDEX [ IF EXISTS ] name RENAME TO new_name
ALTER INDEX [ IF EXISTS ] name SET TABLESPACE tablespace_name
ALTER INDEX name ATTACH PARTITION index_name
ALTER INDEX name [ NO ] DEPENDS ON EXTENSION extension_name
ALTER INDEX [ IF EXISTS ] name SET ( storage_parameter [= value] [, ... ] )
ALTER INDEX [ IF EXISTS ] name RESET ( storage_parameter [, ... ] )
ALTER INDEX [ IF EXISTS ] name ALTER [ COLUMN ] column_number
    SET STATISTICS integer
ALTER INDEX ALL IN TABLESPACE name [ OWNED BY role_name [, ... ] ]
    SET TABLESPACE new_tablespace [ NOWAIT ]
*/
interface AlterIndex
  extends Tagged<
    'AlterIndex',
    {
      readonly name: Ident;
      readonly action: AlterIndexAction;
    }
  > {}
const AlterIndex = (args: UnTag<AlterIndex>): AlterIndex => tag('AlterIndex', args);

type AlterIndexAction =
  | Rename
  | SetTablespace
  | AttachPartition
  | DependsOnExtension
  | SetStorageParameter
  | AlterIndexColumn;

interface AlterAllIndex
  extends Tagged<
    'AlterAllIndex',
    {
      readonly tablespace: Ident;
      readonly owners: Array<Ident>;
      readonly newTablespace: Ident;
      readonly noWait: boolean;
    }
  > {}
const AlterAllIndex = (args: UnTag<AlterAllIndex>): AlterAllIndex => tag('AlterAllIndex', args);

interface AttachPartition
  extends Tagged<
    'AttachPartition',
    {
      readonly index: Ident;
    }
  > {}
const AttachPartition = (args: UnTag<AttachPartition>): AttachPartition => tag('AttachPartition', args);

interface DependsOnExtension
  extends Tagged<
    'DependsOnExtension',
    {
      readonly extension: Ident;
      readonly negate: boolean;
    }
  > {}
const DependsOnExtension = (args: UnTag<DependsOnExtension>): DependsOnExtension => tag('DependsOnExtension', args);

interface SetStorageParameter
  extends Tagged<
    'SetStorageParameter',
    {
      readonly reset: boolean;
      readonly parameters: Array<{ name: Ident; value: Literal | null }>;
    }
  > {}
const SetStorageParameter = (args: UnTag<SetStorageParameter>): SetStorageParameter => tag('SetStorageParameter', args);

interface AlterIndexColumn
  extends Tagged<
    'AlterIndexColumn',
    {
      readonly column: number;
      readonly statistics: number;
    }
  > {}
const AlterIndexColumn = (args: UnTag<AlterIndexColumn>): AlterIndexColumn => tag('AlterIndexColumn', args);

/*
ALTER [ PROCEDURAL ] LANGUAGE name RENAME TO new_name
ALTER [ PROCEDURAL ] LANGUAGE name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterLanguage
  extends Tagged<
    'AlterLanguage',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo;
    }
  > {}
const AlterLanguage = (args: UnTag<AlterLanguage>): AlterLanguage => tag('AlterLanguage', args);

/*
ALTER LARGE OBJECT large_object_oid OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterLargeObject
  extends Tagged<
    'AlterLargeObject',
    {
      readonly name: Ident;
      readonly owner: UserSpec;
    }
  > {}
const AlterLargeObject = (args: UnTag<AlterLargeObject>): AlterLargeObject => tag('AlterLargeObject', args);

/*
ALTER MATERIALIZED VIEW [ IF EXISTS ] name
    action [, ... ]
ALTER MATERIALIZED VIEW name
    [ NO ] DEPENDS ON EXTENSION extension_name
ALTER MATERIALIZED VIEW [ IF EXISTS ] name
    RENAME [ COLUMN ] column_name TO new_column_name
ALTER MATERIALIZED VIEW [ IF EXISTS ] name
    RENAME TO new_name
ALTER MATERIALIZED VIEW [ IF EXISTS ] name
    SET SCHEMA new_schema
ALTER MATERIALIZED VIEW ALL IN TABLESPACE name [ OWNED BY role_name [, ... ] ]
    SET TABLESPACE new_tablespace [ NOWAIT ]

where action is one of:

    ALTER [ COLUMN ] column_name SET STATISTICS integer
    ALTER [ COLUMN ] column_name SET ( attribute_option = value [, ... ] )
    ALTER [ COLUMN ] column_name RESET ( attribute_option [, ... ] )
    ALTER [ COLUMN ] column_name SET STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT }
    ALTER [ COLUMN ] column_name SET COMPRESSION compression_method
    CLUSTER ON index_name
    SET WITHOUT CLUSTER
    SET ACCESS METHOD new_access_method
    SET TABLESPACE new_tablespace
    SET ( storage_parameter [= value] [, ... ] )
    RESET ( storage_parameter [, ... ] )
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterMaterializedView
  extends Tagged<
    'AlterMaterializedView',
    {
      readonly name: Ident;
      readonly ifExists: boolean;
      readonly action: AlterMaterializedViewAction;
    }
  > {}
const AlterMaterializedView = (args: UnTag<AlterMaterializedView>): AlterMaterializedView =>
  tag('AlterMaterializedView', args);

/*
ALTER MATERIALIZED VIEW ALL IN TABLESPACE name [ OWNED BY role_name [, ... ] ]
    SET TABLESPACE new_tablespace [ NOWAIT ]
*/
interface AlterAllMaterializedView
  extends Tagged<
    'AlterAllMaterializedView',
    {
      readonly tablespace: Ident;
      readonly newTablespace: Ident;
      readonly ownedBy: Array<Ident>;
      readonly noWait: boolean;
    }
  > {}
const AlterAllMaterializedView = (args: UnTag<AlterAllMaterializedView>): AlterAllMaterializedView =>
  tag('AlterAllMaterializedView', args);

type AlterMaterializedViewAction = DependsOnExtension | RenameColumn | Rename | SetSchema;

type AlterMaterializedViewMultiAction =
  | SetColumnStatistics
  | SetColumnStorageParameter
  | SetColumnStorage
  | SetColumnCompression
  | ClusterOn
  | SetAccessMethod
  | SetTablespace
  | SetStorageParameter
  | OwnerTo;

interface RenameColumn
  extends Tagged<
    'RenameColumn',
    {
      readonly name: Ident;
      readonly newName: Ident;
    }
  > {}
const RenameColumn = (args: UnTag<RenameColumn>): RenameColumn => tag('RenameColumn', args);

/*
ALTER [ COLUMN ] column_name SET STATISTICS integer
*/
interface SetColumnStatistics
  extends Tagged<
    'SetColumnStatistics',
    {
      readonly name: Ident;
      readonly statistics: number;
    }
  > {}
const SetColumnStatistics = (args: UnTag<SetColumnStatistics>): SetColumnStatistics => tag('SetColumnStatistics', args);

/*
CLUSTER ON index_name
*/
interface ClusterOn
  extends Tagged<
    'ClusterOn',
    {
      readonly index: Ident;
    }
  > {}
const ClusterOn = (args: UnTag<ClusterOn>): ClusterOn => tag('ClusterOn', args);

/*
SET ACCESS METHOD new_access_method
*/
interface SetAccessMethod
  extends Tagged<
    'SetAccessMethod',
    {
      readonly accessMethod: Ident;
    }
  > {}
const SetAccessMethod = (args: UnTag<SetAccessMethod>): SetAccessMethod => tag('SetAccessMethod', args);

/*
ALTER [ COLUMN ] column_name SET COMPRESSION compression_method
*/
interface SetColumnCompression
  extends Tagged<
    'SetColumnCompression',
    {
      readonly method: Ident;
    }
  > {}
const SetColumnCompression = (args: UnTag<SetColumnCompression>): SetColumnCompression =>
  tag('SetColumnCompression', args);

/*
ALTER [ COLUMN ] column_name SET ( attribute_option = value [, ... ] )
ALTER [ COLUMN ] column_name RESET ( attribute_option [, ... ] )
*/
interface SetColumnStorageParameter
  extends Tagged<
    'SetColumnStorageParameter',
    {
      readonly column: Ident;
      readonly reset: boolean;
      readonly options: Array<{ name: Ident; value: Literal }>;
    }
  > {}
const SetColumnStorageParameter = (args: UnTag<SetColumnStorageParameter>): SetColumnStorageParameter =>
  tag('SetColumnStorageParameter', args);

/*
ALTER [ COLUMN ] column_name SET STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT }
*/
interface SetColumnStorage
  extends Tagged<
    'SetColumnStorage',
    {
      readonly column: Ident;
      readonly storage: 'Plain' | 'External' | 'Extended' | 'Main' | 'Default';
    }
  > {}
const SetColumnStorage = (args: UnTag<SetColumnStorage>): SetColumnStorage => tag('SetColumnStorage', args);

/*
ALTER OPERATOR name ( { left_type | NONE } , right_type )
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }

ALTER OPERATOR name ( { left_type | NONE } , right_type )
    SET SCHEMA new_schema

ALTER OPERATOR name ( { left_type | NONE } , right_type )
    SET ( {  RESTRICT = { res_proc | NONE }
           | JOIN = { join_proc | NONE }
         } [, ... ] )
*/
interface AlterOperator
  extends Tagged<
    'AlterOperator',
    {
      readonly name: Ident;
      readonly leftType: DataType | null; // null for unary operators
      readonly rightType: DataType;
      readonly action: OwnerTo | SetSchema | Array<OperatorSetting>;
    }
  > {}
const AlterOperator = (args: UnTag<AlterOperator>): AlterOperator => tag('AlterOperator', args);

interface OperatorSetting
  extends Tagged<
    'OperatorSetting',
    {
      readonly function: Ident | null;
      readonly type: 'Join' | 'Restrict';
    }
  > {}
const OperatorSetting = (args: UnTag<OperatorSetting>): OperatorSetting => tag('OperatorSetting', args);

/*
ALTER OPERATOR CLASS name USING index_method
    RENAME TO new_name

ALTER OPERATOR CLASS name USING index_method
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }

ALTER OPERATOR CLASS name USING index_method
    SET SCHEMA new_schema
*/
interface AlterOperatorClass
  extends Tagged<
    'AlterOperatorClass',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo | SetSchema;
    }
  > {}
const AlterOperatorClass = (args: UnTag<AlterOperatorClass>): AlterOperatorClass => tag('AlterOperatorClass', args);

/*
ALTER OPERATOR FAMILY name USING index_method ADD
  {  OPERATOR strategy_number operator_name ( op_type, op_type )
              [ FOR SEARCH | FOR ORDER BY sort_family_name ]
   | FUNCTION support_number [ ( op_type [ , op_type ] ) ]
              function_name [ ( argument_type [, ...] ) ]
  } [, ... ]

ALTER OPERATOR FAMILY name USING index_method DROP
  {  OPERATOR strategy_number ( op_type [ , op_type ] )
   | FUNCTION support_number ( op_type [ , op_type ] )
  } [, ... ]

ALTER OPERATOR FAMILY name USING index_method
    RENAME TO new_name

ALTER OPERATOR FAMILY name USING index_method
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }

ALTER OPERATOR FAMILY name USING index_method
    SET SCHEMA new_schema
*/
interface AlterOperatorFamily
  extends Tagged<
    'AlterOperatorFamily',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo | SetSchema | DropOperator | AddOperator;
    }
  > {}
const AlterOperatorFamily = (args: UnTag<AlterOperatorFamily>): AlterOperatorFamily => tag('AlterOperatorFamily', args);

/*
ALTER OPERATOR FAMILY name USING index_method DROP
  {  OPERATOR strategy_number ( op_type [ , op_type ] )
   | FUNCTION support_number ( op_type [ , op_type ] )
  } [, ... ]
*/
interface DropOperator
  extends Tagged<
    'DropOperator',
    {
      readonly index: Ident;
      readonly definitions: Array<OperatorDefinition | FunctionDefinition>;
    }
  > {}
const DropOperator = (args: UnTag<DropOperator>): DropOperator => tag('DropOperator', args);

/*
ALTER OPERATOR FAMILY name USING index_method ADD
  {  OPERATOR strategy_number operator_name ( op_type, op_type )
              [ FOR SEARCH | FOR ORDER BY sort_family_name ]
   | FUNCTION support_number [ ( op_type [ , op_type ] ) ]
              function_name [ ( argument_type [, ...] ) ]
  } [, ... ]
*/
interface AddOperator
  extends Tagged<
    'AddOperator',
    {
      readonly index: Ident;
      readonly definitions: Array<OperatorDefinition | FunctionDefinition>;
    }
  > {}
const AddOperator = (args: UnTag<AddOperator>): AddOperator => tag('AddOperator', args);

interface OperatorDefinition
  extends Tagged<
    'OperatorDefinition',
    {
      readonly strategy: number;
      readonly name: Ident;
      readonly leftType: DataType;
      readonly rightType: DataType;
      readonly for: 'Search' | Ident | null;
    }
  > {}
const OperatorDefinition = (args: UnTag<OperatorDefinition>): OperatorDefinition => tag('OperatorDefinition', args);

interface FunctionDefinition
  extends Tagged<
    'FunctionDefinition',
    {
      readonly strategy: number;
      readonly name: Ident;
      readonly leftType: DataType | null;
      readonly rightType: DataType | null;
      readonly args: Array<DataType>;
    }
  > {}
const FunctionDefinition = (args: UnTag<FunctionDefinition>): FunctionDefinition => tag('FunctionDefinition', args);

/*
ALTER POLICY name ON table_name RENAME TO new_name

ALTER POLICY name ON table_name
    [ TO { role_name | PUBLIC | CURRENT_ROLE | CURRENT_USER | SESSION_USER } [, ...] ]
    [ USING ( using_expression ) ]
    [ WITH CHECK ( check_expression ) ]
*/
interface AlterPolicy
  extends Tagged<
    'AlterPolicy',
    {
      readonly name: Ident;
      readonly table: Ident;
      readonly to: Array<UserSpec>;
      readonly using: Expr<PgExtension> | null;
      readonly withCheck: Expr<PgExtension> | null;
    }
  > {}
const AlterPolicy = (args: UnTag<AlterPolicy>): AlterPolicy => tag('AlterPolicy', args);

/*
ALTER PROCEDURE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    action [ ... ] [ RESTRICT ]
ALTER PROCEDURE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    RENAME TO new_name
ALTER PROCEDURE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER PROCEDURE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    SET SCHEMA new_schema
ALTER PROCEDURE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    [ NO ] DEPENDS ON EXTENSION extension_name

where action is one of:

    [ EXTERNAL ] SECURITY INVOKER | [ EXTERNAL ] SECURITY DEFINER
    SET configuration_parameter { TO | = } { value | DEFAULT }
    SET configuration_parameter FROM CURRENT
    RESET configuration_parameter
    RESET ALL
*/
interface AlterProcedure
  extends Tagged<
    'AlterProcedure',
    {
      readonly name: Ident;
      readonly args: Array<{ mode?: ArgMode; name?: Ident; type: DataType }>;
      readonly restrict: boolean;
      readonly action: Array<ProcedureMultiAction> | Rename | OwnerTo | SetSchema | DependsOnExtension;
    }
  > {}
const AlterProcedure = (args: UnTag<AlterProcedure>): AlterProcedure => tag('AlterProcedure', args);

type ArgMode = 'In' | 'Out' | 'InOut' | 'Variadic';

type ProcedureMultiAction = SecurityInvoker | SetStorageParameter | ResetConfig | ResetAll;

interface SecurityInvoker
  extends Tagged<
    'SecurityInvoker',
    {
      readonly external: boolean;
      readonly definer: boolean;
    }
  > {}
const SecurityInvoker = (args: UnTag<SecurityInvoker>): SecurityInvoker => tag('SecurityInvoker', args);

interface ResetAll extends Tagged<'ResetAll', {}> {}
const ResetAll: ResetAll = tag('ResetAll', {});

/*
ALTER PUBLICATION name ADD publication_object [, ...]
ALTER PUBLICATION name SET publication_object [, ...]
ALTER PUBLICATION name DROP publication_object [, ...]
ALTER PUBLICATION name SET ( publication_parameter [= value] [, ... ] )
ALTER PUBLICATION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER PUBLICATION name RENAME TO new_name

where publication_object is one of:

    TABLE [ ONLY ] table_name [ * ] [ ( column_name [, ... ] ) ] [ WHERE ( expression ) ] [, ... ]
    TABLES IN SCHEMA { schema_name | CURRENT_SCHEMA } [, ... ]
*/
interface AlterPublication
  extends Tagged<
    'AlterPublication',
    {
      readonly name: Ident;
      readonly publications: Rename | OwnerTo | SetPublicationParameter | SetPublications;
    }
  > {}
const AlterPublication = (args: UnTag<AlterPublication>): AlterPublication => tag('AlterPublication', args);

interface SetPublicationParameter
  extends Tagged<
    'SetPublicationParameter',
    {
      readonly params: Array<{ name: Ident; value: Literal }>;
    }
  > {}
const SetPublicationParameter = (args: UnTag<SetPublicationParameter>): SetPublicationParameter =>
  tag('SetPublicationParameter', args);

interface SetPublications
  extends Tagged<
    'SetPublications',
    {
      readonly add: boolean;
      readonly definitions: Array<TablePublication | TableInSchemaPublication>;
    }
  > {}
const SetPublications = (args: UnTag<SetPublications>): SetPublications => tag('SetPublications', args);

/*
TABLE [ ONLY ] table_name [ * ] [ ( column_name [, ... ] ) ] [ WHERE ( expression ) ] [, ... ]
*/
interface TablePublication
  extends Tagged<
    'TablePublication',
    {
      readonly table: Ident;
      readonly only: boolean;
      readonly columns: Array<Ident>;
      readonly where: Expr<PgExtension> | null;
    }
  > {}
const TablePublication = (args: UnTag<TablePublication>): TablePublication => tag('TablePublication', args);

/*
TABLES IN SCHEMA { schema_name | CURRENT_SCHEMA } [, ... ]
*/
interface TableInSchemaPublication
  extends Tagged<
    'TableInSchemaPublication',
    {
      readonly schema: Ident | null;
    }
  > {}
const TableInSchemaPublication = (args: UnTag<TableInSchemaPublication>): TableInSchemaPublication =>
  tag('TableInSchemaPublication', args);

/*
ALTER ROLE role_specification [ WITH ] option [ ... ]

where option can be:

      SUPERUSER | NOSUPERUSER
    | CREATEDB | NOCREATEDB
    | CREATEROLE | NOCREATEROLE
    | INHERIT | NOINHERIT
    | LOGIN | NOLOGIN
    | REPLICATION | NOREPLICATION
    | BYPASSRLS | NOBYPASSRLS
    | CONNECTION LIMIT connlimit
    | [ ENCRYPTED ] PASSWORD 'password' | PASSWORD NULL
    | VALID UNTIL 'timestamp'

ALTER ROLE name RENAME TO new_name

ALTER ROLE { role_specification | ALL } [ IN DATABASE database_name ] SET configuration_parameter { TO | = } { value | DEFAULT }
ALTER ROLE { role_specification | ALL } [ IN DATABASE database_name ] SET configuration_parameter FROM CURRENT
ALTER ROLE { role_specification | ALL } [ IN DATABASE database_name ] RESET configuration_parameter
ALTER ROLE { role_specification | ALL } [ IN DATABASE database_name ] RESET ALL

where role_specification can be:

    role_name
  | CURRENT_ROLE
  | CURRENT_USER
  | SESSION_USER
*/
interface AlterRole
  extends Tagged<
    'AlterRole',
    {
      readonly role: UserSpec;
      readonly action: SetConfig | ResetConfig | ResetAll | Array<RoleOption> | Rename;
    }
  > {}
const AlterRole = (args: UnTag<AlterRole>): AlterRole => tag('AlterRole', args);

type RoleOption =
  | 'SuperUser'
  | 'NoSuperUser'
  | 'CreateDB'
  | 'NoCreateDB'
  | 'CreateRole'
  | 'NoCreateRole'
  | 'Inherit'
  | 'NoInherit'
  | 'Login'
  | 'NoLogin'
  | 'Replication'
  | 'NoReplication'
  | 'BypassRLs'
  | 'NoBypassRLs'
  | ConnectionLimit
  | Password
  | ValidUntil;

interface ConnectionLimit
  extends Tagged<
    'ConnectionLimit',
    {
      readonly limit: number;
    }
  > {}
const ConnectionLimit = (args: UnTag<ConnectionLimit>): ConnectionLimit => tag('ConnectionLimit', args);

interface Password
  extends Tagged<
    'Password',
    {
      readonly Encrypted: boolean;
      readonly password: string | null;
    }
  > {}
const Password = (args: UnTag<Password>): Password => tag('Password', args);

interface ValidUntil
  extends Tagged<
    'ValidUntil',
    {
      readonly timestamp: string;
    }
  > {}
const ValidUntil = (args: UnTag<ValidUntil>): ValidUntil => tag('ValidUntil', args);

/*
ALTER ROUTINE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    action [ ... ] [ RESTRICT ]
ALTER ROUTINE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    RENAME TO new_name
ALTER ROUTINE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER ROUTINE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    SET SCHEMA new_schema
ALTER ROUTINE name [ ( [ [ argmode ] [ argname ] argtype [, ...] ] ) ]
    [ NO ] DEPENDS ON EXTENSION extension_name

where action is one of:

    IMMUTABLE | STABLE | VOLATILE
    [ NOT ] LEAKPROOF
    [ EXTERNAL ] SECURITY INVOKER | [ EXTERNAL ] SECURITY DEFINER
    PARALLEL { UNSAFE | RESTRICTED | SAFE }
    COST execution_cost
    ROWS result_rows
    SET configuration_parameter { TO | = } { value | DEFAULT }
    SET configuration_parameter FROM CURRENT
    RESET configuration_parameter
    RESET ALL
*/
interface AlterRoutine
  extends Tagged<
    'AlterRoutine',
    {
      readonly name: Ident;
      readonly args: Array<{ mode?: ArgMode; name?: Ident; type: DataType }>;
      readonly action: Rename | OwnerTo | SetSchema | DependsOnExtension | Array<RoutineOption>;
    }
  > {}
const AlterRoutine = (args: UnTag<AlterRoutine>): AlterRoutine => tag('AlterRoutine', args);

type RoutineOption =
  | 'Immutable'
  | 'Stable'
  | 'Volatile'
  | 'Leakproof'
  | 'NotLeakproof'
  | SecurityInvoker
  | Parallel
  | Cost
  | Rows
  | SetConfig
  | ResetConfig
  | ResetAll;

/*
PARALLEL { UNSAFE | RESTRICTED | SAFE }
*/
interface Parallel
  extends Tagged<
    'Parallel',
    {
      readonly mode: 'Unsafe' | 'Restricted' | 'Safe';
    }
  > {}
const Parallel = (args: UnTag<Parallel>): Parallel => tag('Parallel', args);

/*
ROWS result_rows
*/
interface Rows
  extends Tagged<
    'Rows',
    {
      readonly num: number;
    }
  > {}
const Rows = (args: UnTag<Rows>): Rows => tag('Rows', args);

/*
COST execution_cost
*/
interface Cost
  extends Tagged<
    'Cost',
    {
      readonly cost: number;
    }
  > {}
const Cost = (args: UnTag<Cost>): Cost => tag('Cost', args);

/*
ALTER RULE name ON table_name RENAME TO new_name
*/
interface AlterRule
  extends Tagged<
    'AlterRule',
    {
      readonly name: Ident;
      readonly newName: Ident;
    }
  > {}
const AlterRule = (args: UnTag<AlterRule>): AlterRule => tag('AlterRule', args);

/*
ALTER SCHEMA name RENAME TO new_name
ALTER SCHEMA name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterSchema
  extends Tagged<
    'AlterSchema',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo;
    }
  > {}
const AlterSchema = (args: UnTag<AlterSchema>): AlterSchema => tag('AlterSchema', args);

/*
ALTER SEQUENCE [ IF EXISTS ] name
    [ AS data_type ]
    [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue | NO MINVALUE ] [ MAXVALUE maxvalue | NO MAXVALUE ]
    [ START [ WITH ] start ]
    [ RESTART [ [ WITH ] restart ] ]
    [ CACHE cache ] [ [ NO ] CYCLE ]
    [ OWNED BY { table_name.column_name | NONE } ]
ALTER SEQUENCE [ IF EXISTS ] name SET { LOGGED | UNLOGGED }
ALTER SEQUENCE [ IF EXISTS ] name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER SEQUENCE [ IF EXISTS ] name RENAME TO new_name
ALTER SEQUENCE [ IF EXISTS ] name SET SCHEMA new_schema
*/
interface AlterSequence
  extends Tagged<
    'AlterSequence',
    {
      readonly name: Ident;
      readonly ifExists: boolean;
      readonly action: SetSchema | Rename | OwnerTo | SetLogged | SequenceOptions;
    }
  > {}
const AlterSequence = (args: UnTag<AlterSequence>): AlterSequence => tag('AlterSequence', args);

interface SetLogged
  extends Tagged<
    'SetLogged',
    {
      readonly negate: boolean;
    }
  > {}
const SetLogged = (args: UnTag<SetLogged>): SetLogged => tag('SetLogged', args);

interface SequenceOptions
  extends Tagged<
    'SequenceOptions',
    {
      readonly as: DataType | null;
      readonly increment: number;
      readonly minValue: Literal | null;
      readonly maxValue: Literal | null;
      readonly start: Literal | null;
      readonly restart: Literal | null;
      readonly cache: number | null;
      readonly ownerBy: QualifiedIdent | 'None';
    }
  > {}
const SequenceOptions = (args: UnTag<SequenceOptions>): SequenceOptions => tag('SequenceOptions', args);

/*
ALTER SERVER name [ VERSION 'new_version' ]
    [ OPTIONS ( [ ADD | SET | DROP ] option ['value'] [, ... ] ) ]
ALTER SERVER name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER SERVER name RENAME TO new_name
*/
interface AlterServer
  extends Tagged<
    'AlterServer',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo | ServerOptions;
    }
  > {}
const AlterServer = (args: UnTag<AlterServer>): AlterServer => tag('AlterServer', args);

interface ServerOptions
  extends Tagged<
    'ServerOptions',
    {
      readonly version: StringLit | null;
      readonly options: Array<{ mode: 'Add' | 'Set' | 'Drop'; name: Ident; value: StringLit | null }>;
    }
  > {}
const ServerOptions = (args: UnTag<ServerOptions>): ServerOptions => tag('ServerOptions', args);

/*
ALTER STATISTICS name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER STATISTICS name RENAME TO new_name
ALTER STATISTICS name SET SCHEMA new_schema
ALTER STATISTICS name SET STATISTICS new_target
*/
interface AlterStatistics
  extends Tagged<
    'AlterStatistics',
    {
      readonly name: Ident;
      readonly action: OwnerTo | Rename | SetSchema | SetStatistics;
    }
  > {}
const AlterStatistics = (args: UnTag<AlterStatistics>): AlterStatistics => tag('AlterStatistics', args);

interface SetStatistics
  extends Tagged<
    'SetStatistics',
    {
      readonly target: number;
    }
  > {}
const SetStatistics = (args: UnTag<SetStatistics>): SetStatistics => tag('SetStatistics', args);

/*
ALTER SUBSCRIPTION name CONNECTION 'conninfo'
ALTER SUBSCRIPTION name SET PUBLICATION publication_name [, ...] [ WITH ( publication_option [= value] [, ... ] ) ]
ALTER SUBSCRIPTION name ADD PUBLICATION publication_name [, ...] [ WITH ( publication_option [= value] [, ... ] ) ]
ALTER SUBSCRIPTION name DROP PUBLICATION publication_name [, ...] [ WITH ( publication_option [= value] [, ... ] ) ]
ALTER SUBSCRIPTION name REFRESH PUBLICATION [ WITH ( refresh_option [= value] [, ... ] ) ]
ALTER SUBSCRIPTION name ENABLE
ALTER SUBSCRIPTION name DISABLE
ALTER SUBSCRIPTION name SET ( subscription_parameter [= value] [, ... ] )
ALTER SUBSCRIPTION name SKIP ( skip_option = value )
ALTER SUBSCRIPTION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER SUBSCRIPTION name RENAME TO new_name
*/
interface AlterSubscription
  extends Tagged<
    'AlterSubscription',
    {
      readonly name: Ident;
      readonly action: AlterSubscriptionAction;
    }
  > {}
const AlterSubscription = (args: UnTag<AlterSubscription>): AlterSubscription => tag('AlterSubscription', args);

type AlterSubscriptionAction =
  | Connection
  | SetPublication
  | AddPublication
  | DropPublication
  | RefreshPublication
  | 'Enable'
  | 'Disable'
  | SetParameter
  | Skip
  | OwnerTo
  | Rename;

interface Connection
  extends Tagged<
    'Connection',
    {
      readonly connInfo: string;
    }
  > {}
const Connection = (args: UnTag<Connection>): Connection => tag('Connection', args);

interface AddPublication
  extends Tagged<
    'AddPublication',
    {
      readonly publications: Array<string>;
      readonly refresh: boolean;
    }
  > {}
const AddPublication = (args: UnTag<AddPublication>): AddPublication => tag('AddPublication', args);

interface SetPublication
  extends Tagged<
    'SetPublication',
    {
      readonly publications: Array<string>;
      readonly refresh: boolean;
    }
  > {}
const SetPublication = (args: UnTag<SetPublication>): SetPublication => tag('SetPublication', args);

interface DropPublication
  extends Tagged<
    'DropPublication',
    {
      readonly publications: Array<string>;
      readonly refresh: boolean;
    }
  > {}
const DropPublication = (args: UnTag<DropPublication>): DropPublication => tag('DropPublication', args);

interface RefreshPublication
  extends Tagged<
    'RefreshPublication',
    {
      readonly copyData: boolean;
    }
  > {}
const RefreshPublication = (args: UnTag<RefreshPublication>): RefreshPublication => tag('RefreshPublication', args);

interface SetParameter
  extends Tagged<
    'SetParameter',
    {
      readonly slotName?: string | null;
      readonly synchronousCommit?: 'on' | 'off' | 'remote_write' | 'local' | 'remote_apply';
      readonly binary?: boolean;
      readonly streaming?: 'on' | 'off' | 'parallel';
      readonly disableOnError?: boolean;
      readonly password_required?: boolean;
      readonly runAsOwner?: boolean;
      readonly origin?: string;
    }
  > {}
const SetParameter = (args: UnTag<SetParameter>): SetParameter => tag('SetParameter', args);

interface Skip
  extends Tagged<
    'Skip',
    {
      readonly lsn?: number | null;
    }
  > {}
const Skip = (args: UnTag<Skip>): Skip => tag('Skip', args);

/*
ALTER SYSTEM SET configuration_parameter { TO | = } { value [, ...] | DEFAULT }

ALTER SYSTEM RESET configuration_parameter
ALTER SYSTEM RESET ALL
*/
interface AlterSystem
  extends Tagged<
    'AlterSystem',
    {
      readonly parameters: Array<Literal | Ident | null>; // empty array is ALL, null is DEFAULT
    }
  > {}
const AlterSystem = (args: UnTag<AlterSystem>): AlterSystem => tag('AlterSystem', args);

/*
ALTER TABLESPACE name RENAME TO new_name
ALTER TABLESPACE name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER TABLESPACE name SET ( tablespace_option = value [, ... ] )
ALTER TABLESPACE name RESET ( tablespace_option [, ... ] )
*/
interface AlterTablespace
  extends Tagged<
    'AlterTablespace',
    {
      readonly name: Ident;
      readonly action: OwnerTo | SetTablespaceOption | Rename | ResetTablespaceOption;
    }
  > {}
const AlterTablespace = (args: UnTag<AlterTablespace>): AlterTablespace => tag('AlterTablespace', args);

interface SetTablespaceOption
  extends Tagged<
    'SetTablespaceOption',
    {
      readonly seqPageCost?: number;
      readonly randomPageCost?: number;
      readonly effectIoConcurrency?: number;
      readonly maintenanceIoConcurrency?: number;
    }
  > {}
const SetTablespaceOption = (args: UnTag<SetTablespaceOption>): SetTablespaceOption => tag('SetTablespaceOption', args);

interface ResetTablespaceOption
  extends Tagged<
    'ResetTablespaceOption',
    {
      readonly parameters:
        | 'seq_page_cost'
        | 'random_page_cost'
        | 'effective_io_concurrency'
        | 'maintenance_io_concurrency';
    }
  > {}
const ResetTablespaceOption = (args: UnTag<ResetTablespaceOption>): ResetTablespaceOption =>
  tag('ResetTablespaceOption', args);

/*
ALTER TEXT SEARCH CONFIGURATION name
    ADD MAPPING FOR token_type [, ... ] WITH dictionary_name [, ... ]
ALTER TEXT SEARCH CONFIGURATION name
    ALTER MAPPING FOR token_type [, ... ] WITH dictionary_name [, ... ]
ALTER TEXT SEARCH CONFIGURATION name
    ALTER MAPPING REPLACE old_dictionary WITH new_dictionary
ALTER TEXT SEARCH CONFIGURATION name
    ALTER MAPPING FOR token_type [, ... ] REPLACE old_dictionary WITH new_dictionary
ALTER TEXT SEARCH CONFIGURATION name
    DROP MAPPING [ IF EXISTS ] FOR token_type [, ... ]
ALTER TEXT SEARCH CONFIGURATION name RENAME TO new_name
ALTER TEXT SEARCH CONFIGURATION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER TEXT SEARCH CONFIGURATION name SET SCHEMA new_schema
*/
interface AlterTextSearchConfiguration
  extends Tagged<
    'AlterTextSearchConfiguration',
    {
      readonly name: Ident;
      readonly action: AlterTextSearchConfigurationAction;
    }
  > {}
const AlterTextSearchConfiguration = (args: UnTag<AlterTextSearchConfiguration>): AlterTextSearchConfiguration =>
  tag('AlterTextSearchConfiguration', args);

type AlterTextSearchConfigurationAction =
  | AddMapping
  | AlterMappingForWith
  | AlterMappingReplace
  | AlterMappingForReplace
  | DropMapping
  | Rename
  | OwnerTo
  | SetSchema;

interface AddMapping
  extends Tagged<
    'AddMapping',
    {
      readonly tokenTypes: Array<Ident>;
      readonly dictionaries: Array<Ident>;
    }
  > {}
const AddMapping = (args: UnTag<AddMapping>): AddMapping => tag('AddMapping', args);

interface AlterMappingForWith
  extends Tagged<
    'AlterMappingForWith',
    {
      readonly tokenTypes: Array<Ident>;
      readonly dictionaries: Array<Ident>;
    }
  > {}
const AlterMappingForWith = (args: UnTag<AlterMappingForWith>): AlterMappingForWith => tag('AlterMappingForWith', args);

interface AlterMappingReplace
  extends Tagged<
    'AlterMappingReplace',
    {
      readonly oldDictionary: Ident;
      readonly newDictionary: Ident;
    }
  > {}
const AlterMappingReplace = (args: UnTag<AlterMappingReplace>): AlterMappingReplace => tag('AlterMappingReplace', args);

interface AlterMappingForReplace
  extends Tagged<
    'AlterMappingForReplace',
    {
      readonly tokenTypes: Array<Ident>;
      readonly oldDictionary: Ident;
      readonly newDictionary: Ident;
    }
  > {}
const AlterMappingForReplace = (args: UnTag<AlterMappingForReplace>): AlterMappingForReplace =>
  tag('AlterMappingForReplace', args);

interface DropMapping
  extends Tagged<
    'DropMapping',
    {
      readonly ifExists: boolean;
      readonly tokenTypes: Array<Ident>;
    }
  > {}
const DropMapping = (args: UnTag<DropMapping>): DropMapping => tag('DropMapping', args);

/*
ALTER TEXT SEARCH DICTIONARY name (
    option [ = value ] [, ... ]
)
ALTER TEXT SEARCH DICTIONARY name RENAME TO new_name
ALTER TEXT SEARCH DICTIONARY name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER TEXT SEARCH DICTIONARY name SET SCHEMA new_schema
*/
interface AlterTextSearchDictionary
  extends Tagged<
    'AlterTextSearchDictionary',
    {
      readonly name: Ident;
      readonly action: SetSearchDictionaryOption | Rename | OwnerTo | SetSchema;
    }
  > {}
const AlterTextSearchDictionary = (args: UnTag<AlterTextSearchDictionary>): AlterTextSearchDictionary =>
  tag('AlterTextSearchDictionary', args);

interface SetSearchDictionaryOption
  extends Tagged<
    'SetSearchDictionaryOption',
    {
      readonly options: Array<[Ident, string | null]>;
    }
  > {}
const SetSearchDictionaryOption = (args: UnTag<SetSearchDictionaryOption>): SetSearchDictionaryOption =>
  tag('SetSearchDictionaryOption', args);

/*
ALTER TEXT SEARCH PARSER name RENAME TO new_name
ALTER TEXT SEARCH PARSER name SET SCHEMA new_schema
*/
interface AlterTextSearchParser
  extends Tagged<
    'AlterTextSearchParser',
    {
      readonly name: Ident;
      readonly action: Rename | SetSchema;
    }
  > {}
const AlterTextSearchParser = (args: UnTag<AlterTextSearchParser>): AlterTextSearchParser =>
  tag('AlterTextSearchParser', args);

/*
ALTER TEXT SEARCH TEMPLATE name RENAME TO new_name
ALTER TEXT SEARCH TEMPLATE name SET SCHEMA new_schema
*/
interface AlterTextSearchTemplate
  extends Tagged<
    'AlterTextSearchTemplate',
    {
      readonly name: Ident;
      readonly action: Rename | OwnerTo;
    }
  > {}
const AlterTextSearchTemplate = (args: UnTag<AlterTextSearchTemplate>): AlterTextSearchTemplate =>
  tag('AlterTextSearchTemplate', args);

/*
ALTER TRIGGER name ON table_name RENAME TO new_name
ALTER TRIGGER name ON table_name [ NO ] DEPENDS ON EXTENSION extension_name
*/
interface AlterTrigger
  extends Tagged<
    'AlterTrigger',
    {
      readonly name: Ident;
      readonly table: Ident;
      readonly action: Rename | DependsOnExtension;
    }
  > {}
const AlterTrigger = (args: UnTag<AlterTrigger>): AlterTrigger => tag('AlterTrigger', args);

/*
ALTER TYPE name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER TYPE name RENAME TO new_name
ALTER TYPE name SET SCHEMA new_schema
ALTER TYPE name RENAME ATTRIBUTE attribute_name TO new_attribute_name [ CASCADE | RESTRICT ]
ALTER TYPE name action [, ... ]
ALTER TYPE name ADD VALUE [ IF NOT EXISTS ] new_enum_value [ { BEFORE | AFTER } neighbor_enum_value ]
ALTER TYPE name RENAME VALUE existing_enum_value TO new_enum_value
ALTER TYPE name SET ( property = value [, ... ] )

where action is one of:

    ADD ATTRIBUTE attribute_name data_type [ COLLATE collation ] [ CASCADE | RESTRICT ]
    DROP ATTRIBUTE [ IF EXISTS ] attribute_name [ CASCADE | RESTRICT ]
    ALTER ATTRIBUTE attribute_name [ SET DATA ] TYPE data_type [ COLLATE collation ] [ CASCADE | RESTRICT ]

CASCADE | RESTRICT defaults to RESTRICT
*/
interface AlterType
  extends Tagged<
    'AlterType',
    {
      readonly name: Ident;
      readonly action: AlterTypeAction;
    }
  > {}
const AlterType = (args: UnTag<AlterType>): AlterType => tag('AlterType', args);

type AlterTypeAction =
  | OwnerTo
  | Rename
  | SetSchema
  | RenameAttribute
  | Array<AlterAttribute | DropAttribute | AddAttribute>
  | AddValue
  | Rename
  | SetProperty;

interface RenameAttribute
  extends Tagged<
    'RenameAttribute',
    {
      readonly name: Ident;
      readonly newName: Ident;
      readonly cascade: boolean;
    }
  > {}
const RenameAttribute = (args: UnTag<RenameAttribute>): RenameAttribute => tag('RenameAttribute', args);

interface AlterAttribute
  extends Tagged<
    'AlterAttribute',
    {
      readonly name: Ident;
      readonly type: DataType;
      readonly cascade: boolean;
      readonly collation: Ident;
    }
  > {}
const AlterAttribute = (args: UnTag<AlterAttribute>): AlterAttribute => tag('AlterAttribute', args);

interface DropAttribute
  extends Tagged<
    'DropAttribute',
    {
      readonly name: Ident;
      readonly ifExists: boolean;
      readonly cascade: boolean;
    }
  > {}
const DropAttribute = (args: UnTag<DropAttribute>): DropAttribute => tag('DropAttribute', args);

interface AddAttribute
  extends Tagged<
    'AddAttribute',
    {
      readonly name: Ident;
      readonly type: DataType;
      readonly cascade: boolean;
    }
  > {}
const AddAttribute = (args: UnTag<AddAttribute>): AddAttribute => tag('AddAttribute', args);

//ALTER TYPE name ADD VALUE [ IF NOT EXISTS ] new_enum_value [ { BEFORE | AFTER } neighbor_enum_value ]
interface AddValue
  extends Tagged<
    'AddValue',
    {
      readonly name: Ident;
      readonly ifNotExists: boolean;
      readonly newValue: StringLit;
      readonly neighbor: ['Before' | 'After', StringLit];
    }
  > {}
const AddValue = (args: UnTag<AddValue>): AddValue => tag('AddValue', args);

interface SetProperty
  extends Tagged<
    'SetProperty',
    {
      readonly receive?: Ident | null;
      readonly send?: Ident | null;
      readonly typmodIn?: Ident | null;
      readonly typmodOut?: Ident | null;
      readonly analyze?: Ident | null;
      readonly subscript?: Ident | null;
      readonly storage?: 'Plain' | 'Extended' | 'External' | 'Main';
    }
  > {}
const SetProperty = (args: UnTag<SetProperty>): SetProperty => tag('SetProperty', args);

export {
  PgSchemaManipulation,
  Abort,
  AlterAggregate,
  AlterCollation,
  AlterConversion,
  AlterDatabase,
  PgAlterDomainAction,
  AlterDomainNotNull,
  AlterDomainOwner,
  AlterDomainRename,
  AlterDomainSetSchema,
  AlterEventTrigger,
  AlterEventTriggerAction,
  DisableEventTrigger,
  EnableEventTrigger,
  AlterForeignDataWrapper,
  DataWrapperSettings,
  DataWrapperOption,
  AlterGroupAddUser,
  AlterGroupRename,
  AlterIndex,
  AlterLanguage,
  AlterLargeObject,
  AlterMaterializedView,
  AlterAllMaterializedView,
  AlterOperator,
  AlterOperatorClass,
  AlterOperatorFamily,
  AlterPolicy,
  AlterProcedure,
  AlterPublication,
  AlterRole,
  AlterRoutine,
  AlterRule,
  AlterSchema,
  AlterSequence,
  AlterServer,
  AlterStatistics,
  AlterSubscription,
  AlterSubscriptionAction,
  AlterSystem,
  AlterTablespace,
  AlterTextSearchConfiguration,
  AlterTextSearchDictionary,
  AlterTextSearchParser,
  AlterTextSearchTemplate,
  AlterType,
};
