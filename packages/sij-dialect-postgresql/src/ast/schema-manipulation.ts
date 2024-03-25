import { QualifiedIdent, Ident, DataType, Lit, StringLit, Literal } from 'sij-core/ast';

import { Tagged, UnTag, tag } from 'sij-core/util';

import type { PgExtension } from '.';

type PgSchemaManipulation =
  | Abort
  | AlterAggregate
  | AlterCollation
  | AlterDatabase
//  | AlterDefaultPrivileges
  | AlterEventTrigger
  | AlterForeignDataWrapper
//  | AlterForeignTable
//  | AlterFunction
 | AlterGroupAddUser
 | AlterGroupRename
 | AlterMaterializedView
 | AlterAllMaterializedView
 | AlterOperator
 | AlterOperatorClass
 | AlterOperatorFamily

type UserSpec = Ident | 'CurrentRole' | 'CurrentUser' | 'SessionUser'

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
interface AlterIndex extends Tagged<'AlterIndex', {
  readonly name: Ident
  readonly action: AlterIndexAction
}> {}
const AlterIndex = (args: UnTag<AlterIndex>): AlterIndex => tag('AlterIndex', args);

type AlterIndexAction =
 | Rename
 | SetTablespace
 | AttachPartition
 | DependsOnExtension
 | SetStorageParameter
 | AlterIndexColumn

interface AlterAllIndex extends Tagged<'AlterAllIndex', {
  readonly tablespace: Ident,
  readonly owners: Array<Ident>
  readonly newTablespace: Ident
  readonly noWait: boolean
}> {}
const AlterAllIndex = (args: UnTag<AlterAllIndex>): AlterAllIndex => tag('AlterAllIndex', args);

interface AttachPartition extends Tagged<'AttachPartition', {
  readonly index: Ident
}> {}
const AttachPartition = (args: UnTag<AttachPartition>): AttachPartition => tag('AttachPartition', args);

interface DependsOnExtension extends Tagged<'DependsOnExtension', {
  readonly extension: Ident
  readonly negate: boolean
}> {}
const DependsOnExtension = (args: UnTag<DependsOnExtension>): DependsOnExtension => tag('DependsOnExtension', args);

interface SetStorageParameter extends Tagged<'SetStorageParameter', {
  readonly reset: boolean
  readonly parameters: Array<{ name: Ident, value: Literal | null }>
}> {}
const SetStorageParameter = (args: UnTag<SetStorageParameter>): SetStorageParameter => tag('SetStorageParameter', args);

interface AlterIndexColumn extends Tagged<'AlterIndexColumn', {
  readonly column: number
  readonly statistics: number
}> {}
const AlterIndexColumn = (args: UnTag<AlterIndexColumn>): AlterIndexColumn => tag('AlterIndexColumn', args);

/*
ALTER [ PROCEDURAL ] LANGUAGE name RENAME TO new_name
ALTER [ PROCEDURAL ] LANGUAGE name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterLanguage extends Tagged<'AlterLanguage', {
  readonly name: Ident
  readonly action: Rename | OwnerTo
}> {}
const AlterLanguage = (args: UnTag<AlterLanguage>): AlterLanguage => tag('AlterLanguage', args);

/*
ALTER LARGE OBJECT large_object_oid OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
*/
interface AlterLargeObject extends Tagged<'AlterLargeObject', {
  readonly name: Ident
  readonly owner: UserSpec
}> {}
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
interface AlterMaterializedView extends Tagged<'AlterMaterializedView', {
  readonly name: Ident
  readonly ifExists: boolean
  readonly action: AlterMaterializedViewAction
}> {}
const AlterMaterializedView = (args: UnTag<AlterMaterializedView>): AlterMaterializedView => tag('AlterMaterializedView', args);

/*
ALTER MATERIALIZED VIEW ALL IN TABLESPACE name [ OWNED BY role_name [, ... ] ]
    SET TABLESPACE new_tablespace [ NOWAIT ]
*/
interface AlterAllMaterializedView extends Tagged<'AlterAllMaterializedView', {
  readonly tablespace: Ident
  readonly newTablespace: Ident
  readonly ownedBy: Array<Ident>
  readonly noWait: boolean
}> {}
const AlterAllMaterializedView = (args: UnTag<AlterAllMaterializedView>): AlterAllMaterializedView => tag('AlterAllMaterializedView', args);

type AlterMaterializedViewAction =
 | DependsOnExtension
 | RenameColumn
 | Rename
 | SetSchema

type AlterMaterializedViewMultiAction =
 | SetColumnStatistics
 | SetColumnStorageParameter
 | SetColumnStorage
 | SetColumnCompression
 | ClusterOn
 | SetAccessMethod
 | SetTablespace
 | SetStorageParameter
 | OwnerTo

 
 interface RenameColumn extends Tagged<'RenameColumn', {
   readonly name: Ident
   readonly newName: Ident 
 }> {}
 const RenameColumn = (args: UnTag<RenameColumn>): RenameColumn => tag('RenameColumn', args);

/*
ALTER [ COLUMN ] column_name SET STATISTICS integer
*/
 interface SetColumnStatistics extends Tagged<'SetColumnStatistics', {
   readonly name: Ident
   readonly statistics: number
 }> {}
 const SetColumnStatistics = (args: UnTag<SetColumnStatistics>): SetColumnStatistics => tag('SetColumnStatistics', args);

/*
CLUSTER ON index_name
*/
 interface ClusterOn extends Tagged<'ClusterOn', {
   readonly index: Ident
 }> {}
 const ClusterOn = (args: UnTag<ClusterOn>): ClusterOn => tag('ClusterOn', args);

/*
SET ACCESS METHOD new_access_method
*/
 interface SetAccessMethod extends Tagged<'SetAccessMethod', {
   readonly accessMethod: Ident
 }> {}
 const SetAccessMethod = (args: UnTag<SetAccessMethod>): SetAccessMethod => tag('SetAccessMethod', args);

/*
ALTER [ COLUMN ] column_name SET COMPRESSION compression_method
*/
 interface SetColumnCompression extends Tagged<'SetColumnCompression', {
   readonly 
 }> {}
 const SetColumnCompression = (args: UnTag<SetColumnCompression>): SetColumnCompression => tag('SetColumnCompression', args);

/*
ALTER [ COLUMN ] column_name SET ( attribute_option = value [, ... ] )
ALTER [ COLUMN ] column_name RESET ( attribute_option [, ... ] )
*/
interface SetColumnStorageParameter extends Tagged<'SetColumnStorageParameter', {
  readonly column: Ident
  readonly reset: boolean
  readonly options: Array<{ name: Ident, value: Literal }>
}> {}
const SetColumnStorageParameter = (args: UnTag<SetColumnStorageParameter>): SetColumnStorageParameter => tag('SetColumnStorageParameter', args);

/*
ALTER [ COLUMN ] column_name SET STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN | DEFAULT }
*/
interface SetColumnStorage extends Tagged<'SetColumnStorage', {
  readonly column: Ident
  readonly storage: 'Plain' | 'External' | 'Extended' | 'Main' | 'Default'
}> {}
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
interface AlterOperator extends Tagged<'AlterOperator', {
  readonly name: Ident
  readonly leftType: DataType | null // null for unary operators
  readonly rightType: DataType
  readonly action: OwnerTo | SetSchema | Array<OperatorSetting>
}> {}
const AlterOperator = (args: UnTag<AlterOperator>): AlterOperator => tag('AlterOperator', args);

interface OperatorSetting extends Tagged<'OperatorSetting', {
  readonly function: Ident | null
  readonly type: 'Join' | 'Restrict'
}> {}
const OperatorSetting = (args: UnTag<OperatorSetting>): OperatorSetting => tag('OperatorSetting', args);

/*
ALTER OPERATOR CLASS name USING index_method
    RENAME TO new_name

ALTER OPERATOR CLASS name USING index_method
    OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }

ALTER OPERATOR CLASS name USING index_method
    SET SCHEMA new_schema
*/
interface AlterOperatorClass extends Tagged<'AlterOperatorClass', {
  readonly name: Ident
  readonly action: Rename | OwnerTo | SetSchema
}> {}
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
interface AlterOperatorFamily extends Tagged<'AlterOperatorFamily', {
  readonly name: Ident
  readonly action: Rename | OwnerTo | SetSchema | DropOperator | AddOperator
}> {}
const AlterOperatorFamily = (args: UnTag<AlterOperatorFamily>): AlterOperatorFamily => tag('AlterOperatorFamily', args);

/*
ALTER OPERATOR FAMILY name USING index_method DROP
  {  OPERATOR strategy_number ( op_type [ , op_type ] )
   | FUNCTION support_number ( op_type [ , op_type ] )
  } [, ... ]
*/
interface DropOperator extends Tagged<'DropOperator', {
  readonly index: Ident
  readonly definitions: Array<OperatorDefinition | FunctionDefinition>
}> {}
const DropOperator = (args: UnTag<DropOperator>): DropOperator => tag('DropOperator', args);

/*
ALTER OPERATOR FAMILY name USING index_method ADD
  {  OPERATOR strategy_number operator_name ( op_type, op_type )
              [ FOR SEARCH | FOR ORDER BY sort_family_name ]
   | FUNCTION support_number [ ( op_type [ , op_type ] ) ]
              function_name [ ( argument_type [, ...] ) ]
  } [, ... ]
*/
interface AddOperator extends Tagged<'AddOperator', {
  readonly index: Ident
  readonly definitions: Array<OperatorDefinition | FunctionDefinition>
}> {}
const AddOperator = (args: UnTag<AddOperator>): AddOperator => tag('AddOperator', args);

interface OperatorDefinition extends Tagged<'OperatorDefinition', {
  readonly strategy: number
  readonly name: Ident
  readonly leftType: DataType
  readonly rightType: DataType
  readonly for: 'Search' | Ident | null
}> {}
const OperatorDefinition = (args: UnTag<OperatorDefinition>): OperatorDefinition => tag('OperatorDefinition', args);

interface FunctionDefinition extends Tagged<'FunctionDefinition', {
  readonly strategy: number
  readonly name: Ident
  readonly leftType: DataType | null
  readonly rightType: DataType | null
  readonly args: Array<DataType>
}> {}
const FunctionDefinition = (args: UnTag<FunctionDefinition>): FunctionDefinition => tag('FunctionDefinition', args);

export {
  PgSchemaManipulation,
  Abort,
  AlterAggregate,
  AlterCollation,
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
  AlterMaterializedView,
  AlterAllMaterializedView,
  AlterOperator,
  AlterOperatorClass,
  AlterOperatorFamily,
};
