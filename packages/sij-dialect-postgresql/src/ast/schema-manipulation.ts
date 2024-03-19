import { QualifiedIdent, Ident, DataType } from "sij-core/ast";

import { Tagged, UnTag, tag } from "sij-core/util";

import type { PostgreSqlExtension } from ".";

/*
ABORT [ WORK | TRANSACTION ] [ AND [ NO ] CHAIN ]
*/
interface Abort
  extends Tagged<
    "Abort",
    {
      readonly chain: boolean;
    }
  > {}
const Abort = (args: UnTag<Abort>): Abort => tag("Abort", args);

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
    "AlterAggregate",
    {
      readonly name: QualifiedIdent;
      readonly args: Array<[boolean, DataType]>; // empty is *
      readonly orderBy: Array<[boolean, DataType]>;
      readonly action: AlterObjectAction;
    }
  > {}
const AlterAggregate = (args: UnTag<AlterAggregate>): AlterAggregate =>
  tag("AlterAggregate", args);

type AlterObjectAction = 
 | RenameObject
 | ChangeObjectOwner
 | SetObjectSchema

interface RenameObject
extends Tagged<
  "RenameObject",
  {
    readonly newName: QualifiedIdent;
  }
> {}
const RenameObject = (args: UnTag<RenameObject>): RenameObject =>
tag("RenameObject", args);


interface ChangeObjectOwner
extends Tagged<
  "ChangeObjectOwner",
  {
    readonly owner: Ident | 'CurrentRole' | 'CurrentUser' | 'SessionUser';
  }
> {}
const ChangeObjectOwner = (args: UnTag<ChangeObjectOwner>): ChangeObjectOwner =>
tag("ChangeObjectOwner", args);

interface SetObjectSchema
extends Tagged<
  "SetObjectSchema",
  {
    readonly owner: Ident;
  }
> {}
const SetObjectSchema = (args: UnTag<SetObjectSchema>): SetObjectSchema =>
tag("SetObjectSchema", args);

/*
ALTER COLLATION name REFRESH VERSION

ALTER COLLATION name RENAME TO new_name
ALTER COLLATION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER COLLATION name SET SCHEMA new_schema
*/
interface AlterCollation
extends Tagged<
  "AlterCollation",
  {
    readonly name: Ident;
    readonly action: AlterObjectAction;
  }
> {}
const AlterCollation = (args: UnTag<AlterCollation>): AlterCollation =>
tag("AlterCollation", args);

/*
ALTER CONVERSION name RENAME TO new_name
ALTER CONVERSION name OWNER TO { new_owner | CURRENT_ROLE | CURRENT_USER | SESSION_USER }
ALTER CONVERSION name SET SCHEMA new_schema
*/
interface AlterConversion
extends Tagged<
  "AlterConversion",
  {
    readonly name: Ident;
    readonly action: AlterObjectAction;
  }
> {}
const AlterConversion = (args: UnTag<AlterConversion>): AlterConversion =>
tag("AlterConversion", args);

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