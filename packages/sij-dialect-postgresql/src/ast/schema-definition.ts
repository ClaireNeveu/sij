import { DataType, Ident, QualifiedIdent, StringLit } from 'sij-core/ast';
import { Tagged, UnTag, tag } from 'sij-core/util';

type PgSchemaDefinition = CreateAccessMethod | CreateAggregate;

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

export { PgSchemaDefinition, CreateAccessMethod, CreateAggregate };
