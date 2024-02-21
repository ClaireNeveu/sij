import { Ident } from './expr';
import { Query } from './query';
import {
  AssertionDefinition,
  ColumnDefinition,
  ConstraintCheckTime,
  DefaultOption,
  Privilege,
  TableConstraint,
} from './schema-definition';
import { Extension, Tagged, UnTag, tag } from './util';

/*
<SQL schema manipulation statement> ::=
    <drop schema statement>
  | <alter table statement>
  | <drop table statement>
  | <drop view statement>
  | <revoke statement>
  | <alter domain statement>
  | <drop domain statement>
  | <drop character set statement> // Not implemented in major DBs
  | <drop collation statement> // Not implemented in major DBs
  | <drop translation statement> // Not implemented in major DBs
  | <drop assertion statement>
*/
type SchemaManipulationStatement<Ext extends Extension> =
  | DropSchema
  | DropTable
  | DropView
  | RevokePrivilege
  | DropDomain
  | DropAssertion
  | AlterTable<Ext>
  | AlterDomain;

/*
<drop behavior> ::= CASCADE | RESTRICT
*/
type DropBehavior = 'Cascade' | 'Restrict';

/*
<drop schema statement> ::=
    DROP SCHEMA <schema name> <drop behavior>
*/
interface DropSchema
  extends Tagged<
    'DropSchema',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropSchema = (args: UnTag<DropSchema>): DropSchema => tag('DropSchema', args);

/*
<alter table statement> ::=
    ALTER TABLE <table name> <alter table action>
*/
interface AlterTable<Ext extends Extension>
  extends Tagged<
    'AlterTable',
    {
      readonly name: Ident;
      readonly action: AlterTableAction<Ext>;
    }
  > {}
const AlterTable = <Ext extends Extension>(args: UnTag<AlterTable<Ext>>): AlterTable<Ext> => tag('AlterTable', args);

/*
<alter table action> ::=
      <add column definition>
    | <alter column definition>
    | <drop column definition>
    | <add table constraint definition>
    | <drop table constraint definition>
*/
type AlterTableAction<Ext extends Extension> =
  | ColumnDefinition<Ext>
  | AlterColumn
  | DropColumn
  | AddTableConstraint
  | DropTableConstraint;

/*
<alter column definition> ::=
    ALTER [ COLUMN ] <column name> <alter column action>

<alter column action> ::=
      <set column default clause>
    | <drop column default clause>

<set column default clause> ::=
  SET <default clause>

<drop column default clause> ::=
  DROP DEFAULT
*/
interface AlterColumn
  extends Tagged<
    'AlterColumn',
    {
      readonly name: Ident;
      readonly action: SetDefault | DropDefault; // TODO check if there are common other actions in dialects
    }
  > {}
const AlterColumn = (args: UnTag<AlterColumn>): AlterColumn => tag('AlterColumn', args);

/*
<drop column definition> ::=
  DROP [ COLUMN ] <column name> <drop behavior>
*/
interface DropColumn
  extends Tagged<
    'DropColumn',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropColumn = (args: UnTag<DropColumn>): DropColumn => tag('DropColumn', args);

/*
<add table constraint definition> ::=
  ADD <table constraint definition>
*/
interface AddTableConstraint
  extends Tagged<
    'AddTableConstraint',
    {
      readonly constraint: TableConstraint;
    }
  > {}
const AddTableConstraint = (args: UnTag<AddTableConstraint>): AddTableConstraint => tag('AddTableConstraint', args);

/*
<drop table constraint definition> ::=
  DROP CONSTRAINT <constraint name> <drop behavior>
*/
interface DropTableConstraint
  extends Tagged<
    'DropTableConstraint',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropTableConstraint = (args: UnTag<DropTableConstraint>): DropTableConstraint => tag('DropTableConstraint', args);

/*
<drop table statement> ::=
    DROP TABLE <table name> <drop behavior>
*/
interface DropTable
  extends Tagged<
    'DropTable',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropTable = (args: UnTag<DropTable>): DropTable => tag('DropTable', args);

/*
<drop view statement> ::=
    DROP VIEW <table name> <drop behavior>
*/
interface DropView
  extends Tagged<
    'DropView',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropView = (args: UnTag<DropView>): DropView => tag('DropView', args);

/*
<revoke statement> ::=
  REVOKE [ GRANT OPTION FOR ] <privileges>
      ON <object name>
    FROM <grantee> [ { <comma> <grantee> }... ] <drop behavior>
*/
interface RevokePrivilege
  extends Tagged<
    'RevokePrivilege',
    {
      readonly privileges: Array<Privilege> | null;
      readonly object: Ident;
      readonly grantees: Array<Ident>; // non-empty
      readonly grantOptionFor: boolean;
      readonly behavior: DropBehavior;
    }
  > {}
const RevokePrivilege = (args: UnTag<RevokePrivilege>): RevokePrivilege => tag('RevokePrivilege', args);

/*
<alter domain statement> ::=
    ALTER DOMAIN <domain name> <alter domain action>
*/
interface AlterDomain
  extends Tagged<
    'AlterDomain',
    {
      readonly name: Ident;
      readonly action: DomainAction;
      readonly behavior: DropBehavior;
    }
  > {}
const AlterDomain = (args: UnTag<AlterDomain>): AlterDomain => tag('AlterDomain', args);

/*
<alter domain action> ::=
      <set domain default clause>
    | <drop domain default clause>
    | <add domain constraint definition>
    | <drop domain constraint definition>
*/
type DomainAction = SetDefault | DropDefault | AddDomainConstraint | DropDomainConstraint;

/*
<set domain default clause> ::= SET <default clause>
*/
interface SetDefault
  extends Tagged<
    'SetDefault',
    {
      readonly default: DefaultOption;
    }
  > {}
const SetDefault = (args: UnTag<SetDefault>): SetDefault => tag('SetDefault', args);

/*
<drop domain default clause> ::= DROP DEFAULT
*/
interface DropDefault extends Tagged<'DropDefault', {}> {}
const DropDefault: DropDefault = tag('DropDefault', {});

/*
<add domain constraint definition> ::=
  ADD <domain constraint>
*/
interface AddDomainConstraint
  extends Tagged<
    'AddDomainConstraint',
    {
      readonly constraint: AssertionDefinition;
    }
  > {}
const AddDomainConstraint = (args: UnTag<AddDomainConstraint>): AddDomainConstraint => tag('AddDomainConstraint', args);

/*
<drop domain constraint definition> ::=
  DROP CONSTRAINT <constraint name>
*/
interface DropDomainConstraint
  extends Tagged<
    'DropDomainConstraint',
    {
      readonly name: Ident;
    }
  > {}
const DropDomainConstraint = (args: UnTag<DropDomainConstraint>): DropDomainConstraint =>
  tag('DropDomainConstraint', args);

/*
<drop domain statement> ::=
  DROP DOMAIN <domain name> <drop behavior>
*/
interface DropDomain
  extends Tagged<
    'DropDomain',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
    }
  > {}
const DropDomain = (args: UnTag<DropDomain>): DropDomain => tag('DropDomain', args);

/*
<drop assertion statement> ::=
  DROP ASSERTION <constraint name>
*/
interface DropAssertion
  extends Tagged<
    'DropAssertion',
    {
      readonly name: Ident;
    }
  > {}
const DropAssertion = (args: UnTag<DropAssertion>): DropAssertion => tag('DropAssertion', args);

export {
  SchemaManipulationStatement,
  DropSchema,
  DropTable,
  DropView,
  RevokePrivilege,
  DropDomain,
  DropAssertion,
  AlterDomain,
  AlterTable,
  AlterTableAction,
  AlterColumn,
  SetDefault,
  DropDefault,
  DropBehavior,
  DropColumn,
  AddTableConstraint,
  DropTableConstraint,
  DomainAction,
  AddDomainConstraint,
};
