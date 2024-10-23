import { CheckConstraint, ColumnConstraintDefinition, ConstraintDefinition, DataType, Expr, Ident, Lit, Literal, QualifiedIdent, Query, StringLit } from 'sij-core/ast';
import { Tagged, UnTag, tag } from 'sij-core/util';
import { PgExtension } from '.';

type PgSchemaDefinition =
  | CreateAccessMethod
  | CreateAggregate
  | CreateCast
  | CreateCollation
  | CreateConversion
  | CreateDatabase
  | CreateDomain
  | CreateEventTrigger
  | CreateExtension
  | CreateForeignDataWrapper
  | CreateIndex
  | CreateLanguage
  | CreateMaterializedView
  | CreateOperator;

/*
CREATE ACCESS METHOD name
    TYPE access_method_type
    HANDLER handler_function
*/
interface CreateAccessMethod
  extends Tagged<
    'CreateAccessMethod',
    {
      readonly name: Ident;
      readonly type: 'Table' | 'Index';
      readonly handler: QualifiedIdent;
    }
  > {}
const CreateAccessMethod = (args: UnTag<CreateAccessMethod>): CreateAccessMethod => tag('CreateAccessMethod', args);

/*
CREATE [ OR REPLACE ] AGGREGATE name ( [ argmode ] [ argname ] arg_data_type [ , ... ] ) (
    SFUNC = sfunc,
    STYPE = state_data_type
    [ , SSPACE = state_data_size ]
    [ , FINALFUNC = ffunc ]
    [ , FINALFUNC_EXTRA ]
    [ , FINALFUNC_MODIFY = { READ_ONLY | SHAREABLE | READ_WRITE } ]
    [ , COMBINEFUNC = combinefunc ]
    [ , SERIALFUNC = serialfunc ]
    [ , DESERIALFUNC = deserialfunc ]
    [ , INITCOND = initial_condition ]
    [ , MSFUNC = msfunc ]
    [ , MINVFUNC = minvfunc ]
    [ , MSTYPE = mstate_data_type ]
    [ , MSSPACE = mstate_data_size ]
    [ , MFINALFUNC = mffunc ]
    [ , MFINALFUNC_EXTRA ]
    [ , MFINALFUNC_MODIFY = { READ_ONLY | SHAREABLE | READ_WRITE } ]
    [ , MINITCOND = minitial_condition ]
    [ , SORTOP = sort_operator ]
    [ , PARALLEL = { SAFE | RESTRICTED | UNSAFE } ]
)

CREATE [ OR REPLACE ] AGGREGATE name ( [ [ argmode ] [ argname ] arg_data_type [ , ... ] ]
                        ORDER BY [ argmode ] [ argname ] arg_data_type [ , ... ] ) (
    SFUNC = sfunc,
    STYPE = state_data_type
    [ , SSPACE = state_data_size ]
    [ , FINALFUNC = ffunc ]
    [ , FINALFUNC_EXTRA ]
    [ , FINALFUNC_MODIFY = { READ_ONLY | SHAREABLE | READ_WRITE } ]
    [ , INITCOND = initial_condition ]
    [ , PARALLEL = { SAFE | RESTRICTED | UNSAFE } ]
    [ , HYPOTHETICAL ]
)
*/
interface CreateAggregate
  extends Tagged<
    'CreateAggregate',
    {
      readonly name: QualifiedIdent;
      readonly arguments: Array<AggregateFunctionArg>; // array must be non-empty
      readonly sFunc: QualifiedIdent;
      readonly sType: DataType;
      readonly orReplace: boolean;
      readonly sSpace: number | null;
      readonly finalFunc: QualifiedIdent | null;
      readonly finalFuncExtra: boolean;
      readonly finalFuncModify: 'ReadOnly' | 'Shareable' | 'ReadWrite' | null;
      readonly initCond: StringLit | null;
      readonly parallel: 'Safe' | 'Restricted' | 'Unsafe';
      readonly extra: AdditionalAggregateArgs | AggregateOrderArgs | null;
    }
  > {}
const CreateAggregate = (args: UnTag<CreateAggregate>): CreateAggregate => tag('CreateAggregate', args);

interface AggregateFunctionArg
  extends Tagged<
    'AggregateFunctionArg',
    {
      readonly mode: 'In' | 'Variadic';
      readonly name: string | null;
      readonly type: DataType;
    }
  > {}
const AggregateFunctionArg = (args: UnTag<AggregateFunctionArg>): AggregateFunctionArg =>
  tag('AggregateFunctionArg', args);

interface AdditionalAggregateArgs
  extends Tagged<
    'AdditionalAggregateArgs',
    {
      readonly combineFunc: QualifiedIdent | null;
      readonly serialFunc: QualifiedIdent | null;
      readonly deserialFunc: QualifiedIdent | null;
      readonly msFunc: QualifiedIdent | null;
      readonly minVFunc: QualifiedIdent | null;
      readonly msType: DataType | null;
      readonly msSpace: number | null;
      readonly mFinalFunc: QualifiedIdent | null;
      readonly mFinalFuncExtra: boolean;
      readonly bfinalFuncModify: 'ReadOnly' | 'Shareable' | 'ReadWrite' | null;
      readonly mInitCond: StringLit | null;
      readonly sortOp: QualifiedIdent | null;
    }
  > {}
const AdditionalAggregateArgs = (args: UnTag<AdditionalAggregateArgs>): AdditionalAggregateArgs =>
  tag('AdditionalAggregateArgs', args);

interface AggregateOrderArgs
  extends Tagged<
    'AggregateOrderArgs',
    {
      readonly orderBy: Array<AggregateFunctionArg>; // Must be non-empty
      readonly hypothetical: boolean;
    }
  > {}
const AggregateOrderArgs = (args: UnTag<AggregateOrderArgs>): AggregateOrderArgs => tag('AggregateOrderArgs', args);

/*
CREATE CAST (source_type AS target_type)
    WITH FUNCTION function_name [ (argument_type [, ...]) ]
    [ AS ASSIGNMENT | AS IMPLICIT ]

CREATE CAST (source_type AS target_type)
    WITHOUT FUNCTION
    [ AS ASSIGNMENT | AS IMPLICIT ]

CREATE CAST (source_type AS target_type)
    WITH INOUT
    [ AS ASSIGNMENT | AS IMPLICIT ]
*/
interface CreateCast
  extends Tagged<
    'CreateCast',
    {
      readonly sourceType: string;
      readonly targetType: string;
      readonly mode: 'WithoutFunction' | 'WithInout' | { name: string; args: Array<string> };
      readonly implicit: null | 'AsAssignmnet' | 'AsImplicit';
    }
  > {}
const CreateCast = (args: UnTag<CreateCast>): CreateCast => tag('CreateCast', args);

/*
CREATE COLLATION [ IF NOT EXISTS ] name (
    [ LOCALE = locale, ]
    [ LC_COLLATE = lc_collate, ]
    [ LC_CTYPE = lc_ctype, ]
    [ PROVIDER = provider, ]
    [ DETERMINISTIC = boolean, ]
    [ RULES = rules, ]
    [ VERSION = version ]
)
CREATE COLLATION [ IF NOT EXISTS ] name FROM existing_collation
*/
interface CreateCollation
  extends Tagged<
    'CreateCollation',
    {
      readonly name: Ident;
      readonly options:
        | Ident
        | {
            readonly locale: string | null;
            readonly lcCollate: string | null;
            readonly lcCtype: string | null;
            readonly provider: string | null;
            readonly deterministic: boolean; // Default true
            readonly rules: string | null;
            readonly version: string | null;
          };
    }
  > {}
const CreateCollation = (args: UnTag<CreateCollation>): CreateCollation => tag('CreateCollation', args);

/*
CREATE [ DEFAULT ] CONVERSION name
    FOR source_encoding TO dest_encoding FROM function_name
*/
interface CreateConversion
  extends Tagged<
    'CreateConversion',
    {
      readonly default: boolean;
      readonly sourceEncoding: string;
      readonly destEncoding: string;
      readonly functionName: QualifiedIdent;
    }
  > {}
const CreateConversion = (args: UnTag<CreateConversion>): CreateConversion => tag('CreateConversion', args);

/*
CREATE DATABASE name
    [ WITH ] [ OWNER [=] user_name ]
           [ TEMPLATE [=] template ]
           [ ENCODING [=] encoding ]
           [ STRATEGY [=] strategy ]
           [ LOCALE [=] locale ]
           [ LC_COLLATE [=] lc_collate ]
           [ LC_CTYPE [=] lc_ctype ]
           [ BUILTIN_LOCALE [=] builtin_locale ]
           [ ICU_LOCALE [=] icu_locale ]
           [ ICU_RULES [=] icu_rules ]
           [ LOCALE_PROVIDER [=] locale_provider ]
           [ COLLATION_VERSION = collation_version ]
           [ TABLESPACE [=] tablespace_name ]
           [ ALLOW_CONNECTIONS [=] allowconn ]
           [ CONNECTION LIMIT [=] connlimit ]
           [ IS_TEMPLATE [=] istemplate ]
           [ OID [=] oid ]
*/
interface CreateDatabase
  extends Tagged<
    'CreateDatabase',
    {
      readonly name: Ident;
      readonly owner: string | null;
      readonly template: Ident | 'Default' | null;
      readonly encoding: Ident | 'Default' | null;
      readonly strategy: string | null;
      readonly locale: string | null;
      readonly lcCollate: string | null;
      readonly lcCtype: string | null;
      readonly builtinLocale: 'C' | 'C.UTF-8' | null;
      readonly icuLocale: string | null;
      readonly icuRules: string | null;
      readonly localeProvider: 'builtin' | 'icu' | 'libc' | null;
      readonly collationVersion: string | null;
      readonly tablespace: Ident | 'Default' | null;
      readonly allowConnections: boolean | null;
      readonly connectionLimit: number | null;
      readonly isTemplate: boolean | null;
      readonly oid: string | null;
    }
  > {}
const CreateDatabase = (args: UnTag<CreateDatabase>): CreateDatabase => tag('CreateDatabase', args);

/*
CREATE DOMAIN name [ AS ] data_type
    [ COLLATE collation ]
    [ DEFAULT expression ]
    [ domain_constraint [ ... ] ]

where domain_constraint is:

[ CONSTRAINT constraint_name ]
{ NOT NULL | NULL | CHECK (expression) }
 */
interface CreateDomain extends Tagged<'CreateDomain', {
  readonly name: QualifiedIdent;
  readonly dataType: DataType;
  readonly collate: QualifiedIdent | null;
  readonly default: Expr<PgExtension> | null;
  readonly constraints: Array<ColumnConstraintDefinition<PgExtension>>;
}> {}
const CreateDomain = (args: UnTag<CreateDomain>): CreateDomain => tag('CreateDomain', args);

/*
CREATE EVENT TRIGGER name
    ON event
    [ WHEN filter_variable IN (filter_value [, ... ]) [ AND ... ] ]
    EXECUTE { FUNCTION | PROCEDURE } function_name()
*/
interface CreateEventTrigger extends Tagged<'CreateEventTrigger', {
  readonly name: Ident;
  readonly event: string;
  readonly filters: Array<CreateEventFilter>;
  readonly functionName: QualifiedIdent;
}> {}
const CreateEventTrigger = (args: UnTag<CreateEventTrigger>): CreateEventTrigger => tag('CreateEventTrigger', args);

type CreateEventFilter = {
  variable: 'TAG',
  values: Array<string>,
}

/*
CREATE EXTENSION [ IF NOT EXISTS ] extension_name
    [ WITH ] [ SCHEMA schema_name ]
             [ VERSION version ]
             [ CASCADE ]
*/
interface CreateExtension extends Tagged<'CreateExtension', {
  readonly ifNotExists: boolean;
  readonly name: Ident;
  readonly schema: Ident | null;
  readonly version: Ident | StringLit | null;
  readonly cascade: boolean | null;
}> {}
const CreateExtension = (args: UnTag<CreateExtension>): CreateExtension => tag('CreateExtension', args);

/*
CREATE FOREIGN DATA WRAPPER name
    [ HANDLER handler_function | NO HANDLER ]
    [ VALIDATOR validator_function | NO VALIDATOR ]
    [ OPTIONS ( option 'value' [, ... ] ) ]
*/
interface CreateForeignDataWrapper extends Tagged<'CreateForeignDataWrapper', {
  readonly name: Ident;
  readonly handler: Ident | null;
  readonly validator: Ident | null;
  readonly options: Array<[string, Literal]>
}> {}
const CreateForeignDataWrapper = (args: UnTag<CreateForeignDataWrapper>): CreateForeignDataWrapper => tag('CreateForeignDataWrapper', args);

/*
CREATE FOREIGN TABLE [ IF NOT EXISTS ] table_name ( [
  { column_name data_type [ OPTIONS ( option 'value' [, ... ] ) ] [ COLLATE collation ] [ column_constraint [ ... ] ]
    | table_constraint }
    [, ... ]
] )
[ INHERITS ( parent_table [, ... ] ) ]
  SERVER server_name
[ OPTIONS ( option 'value' [, ... ] ) ]

CREATE FOREIGN TABLE [ IF NOT EXISTS ] table_name
  PARTITION OF parent_table [ (
  { column_name [ WITH OPTIONS ] [ column_constraint [ ... ] ]
    | table_constraint }
    [, ... ]
) ]
{ FOR VALUES partition_bound_spec | DEFAULT }
  SERVER server_name
[ OPTIONS ( option 'value' [, ... ] ) ]

where column_constraint is:

[ CONSTRAINT constraint_name ]
{ NOT NULL |
  NULL |
  CHECK ( expression ) [ NO INHERIT ] |
  DEFAULT default_expr |
  GENERATED ALWAYS AS ( generation_expr ) STORED }

and table_constraint is:

[ CONSTRAINT constraint_name ]
CHECK ( expression ) [ NO INHERIT ]

and partition_bound_spec is:

IN ( partition_bound_expr [, ...] ) |
FROM ( { partition_bound_expr | MINVALUE | MAXVALUE } [, ...] )
  TO ( { partition_bound_expr | MINVALUE | MAXVALUE } [, ...] ) |
WITH ( MODULUS numeric_literal, REMAINDER numeric_literal )
*/
/*
TODO
interface CreateForeignTable extends Tagged<'CreateForeignTable', {
  readonly name: QualifiedIdent;
  readonly
}> {}
const CreateForeignTable = (args: UnTag<CreateForeignTable>): CreateForeignTable => tag('CreateForeignTable', args);
*/

/*
CREATE [ UNIQUE ] INDEX [ CONCURRENTLY ] [ [ IF NOT EXISTS ] name ] ON [ ONLY ] table_name [ USING method ]
    ( { column_name | ( expression ) } [ COLLATE collation ] [ opclass [ ( opclass_parameter = value [, ... ] ) ] ] [ ASC | DESC ] [ NULLS { FIRST | LAST } ] [, ...] )
    [ INCLUDE ( column_name [, ...] ) ]
    [ NULLS [ NOT ] DISTINCT ]
    [ WITH ( storage_parameter [= value] [, ... ] ) ]
    [ TABLESPACE tablespace_name ]
    [ WHERE predicate ]
*/
interface CreateIndex extends Tagged<'CreateIndex', {
  readonly name: Ident;
  readonly unique: boolean; // default is false
  readonly concurrently: boolean; // default is false
  readonly ifNotExists: boolean; // default is false
  readonly table: QualifiedIdent;
  readonly only: boolean; // default is false
  readonly using: string; // default is btree
  readonly columns: Array<IndexCondition> // usually Ident
  readonly include: Array<Ident>;
  readonly nullsDistinct: boolean; // default true
  // options are defined for regular methods but users can install their own
  readonly with: Array<[string, Literal | null]>;
  readonly tablespace: Ident;
  readonly where: Expr<PgExtension>;
}> {}
const CreateIndex = (args: UnTag<CreateIndex>): CreateIndex => tag('CreateIndex', args);

type IndexCondition = {
  expr: Expr<PgExtension>,
  collate: Ident | null;
  ops: Array<[string, Literal | null]>;
  order: 'Asc' | 'Desc' | 'null';
  nulls: 'First' | 'Last' | null
}

/*
CREATE [ OR REPLACE ] [ TRUSTED ] [ PROCEDURAL ] LANGUAGE name
    HANDLER call_handler [ INLINE inline_handler ] [ VALIDATOR valfunction ]
CREATE [ OR REPLACE ] [ TRUSTED ] [ PROCEDURAL ] LANGUAGE name
*/
interface CreateLanguage extends Tagged<'CreateLanguage', {
  readonly name: Ident;
  readonly orReplace: boolean // default is false
  readonly trusted: boolean // default is false
  readonly handler: Ident | null;
  readonly inline: Ident | null;
  readonly validator: Ident | null;
}> {}
const CreateLanguage = (args: UnTag<CreateLanguage>): CreateLanguage => tag('CreateLanguage', args);

/*
CREATE MATERIALIZED VIEW [ IF NOT EXISTS ] table_name
    [ (column_name [, ...] ) ]
    [ USING method ]
    [ WITH ( storage_parameter [= value] [, ... ] ) ]
    [ TABLESPACE tablespace_name ]
    AS query
    [ WITH [ NO ] DATA ]
*/
interface CreateMaterializedView extends Tagged<'CreateMaterializedView', {
  readonly tableName: QualifiedIdent;
  readonly columsn: Array<Ident>;
  readonly using: string | null;
  readonly with: Array<[string, Literal | null]>;
  readonly tablespace: Ident | null;
  readonly as: Query<PgExtension>;
  readonly withData: boolean // default is true;
}> {}
const CreateMaterializedView = (args: UnTag<CreateMaterializedView>): CreateMaterializedView => tag('CreateMaterializedView', args);

/*
CREATE OPERATOR name (
    {FUNCTION|PROCEDURE} = function_name
    [, LEFTARG = left_type ] [, RIGHTARG = right_type ]
    [, COMMUTATOR = com_op ] [, NEGATOR = neg_op ]
    [, RESTRICT = res_proc ] [, JOIN = join_proc ]
    [, HASHES ] [, MERGES ]
)
*/
interface CreateOperator extends Tagged<'CreateOperator', {
  readonly name: QualifiedIdent;
  readonly function: QualifiedIdent;
  readonly leftArg: DataType | null;
  readonly rightArg: DataType | null;
  readonly commutator: QualifiedIdent | null;
  readonly negator: QualifiedIdent | null;
  readonly restrict: QualifiedIdent | null;
  readonly join: QualifiedIdent | null;
  readonly hashes: boolean // default is false;
  readonly merges: boolean // default is false;
}> {}
const CreateOperator = (args: UnTag<CreateOperator>): CreateOperator => tag('CreateOperator', args);

export {
  PgSchemaDefinition,
  CreateAccessMethod,
  CreateAggregate,
  CreateCast,
  CreateCollation,
  CreateConversion,
  CreateDatabase,
  CreateDomain,
  CreateEventTrigger,
  CreateEventFilter,
  CreateExtension,
  CreateForeignDataWrapper,
  CreateIndex,
  CreateLanguage,
  CreateMaterializedView,
  CreateOperator,
};
