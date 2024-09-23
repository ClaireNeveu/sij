import { DataType, Ident, QualifiedIdent, StringLit } from 'sij-core/ast';
import { Tagged, UnTag, tag } from 'sij-core/util';

type PgSchemaDefinition = CreateAccessMethod | CreateAggregate | CreateCast | CreateCollation;

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
interface CreateCast extends Tagged<'CreateCast', {
  readonly sourceType: string;
  readonly targetType: string;
  readonly mode: 'WithoutFunction' | 'WithInout' | { name: string, args: Array<string> }
  readonly implicit: null | 'AsAssignmnet' | 'AsImplicit'
}> {}
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
interface CreateCollation extends Tagged<'CreateCollation', {
  readonly name: Ident;
  readonly options: Ident | {
    readonly locale: string | null;
    readonly lcCollate: string | null;
    readonly lcCtype: string | null;
    readonly provider: string | null;
    readonly deterministic: boolean; // Default true
    readonly rules: string | null;
    readonly version: string | null;
  }
}> {}
const CreateCollation = (args: UnTag<CreateCollation>): CreateCollation => tag('CreateCollation', args);

export { PgSchemaDefinition, CreateAccessMethod, CreateAggregate, CreateCast, CreateCollation };
