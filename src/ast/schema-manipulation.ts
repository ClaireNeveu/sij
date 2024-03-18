import { Ident, QualifiedIdent } from './expr';
import { Query } from './query';
import {
  CheckConstraint,
  ColumnDefinition,
  ConstraintCheckTime,
  ConstraintDefinition,
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
  | DropSchema<Ext>
  | DropTable<Ext>
  | DropView<Ext>
  | RevokePrivilege<Ext>
  | DropDomain<Ext>
  | DropAssertion<Ext>
  | AlterTable<Ext>
  | AlterDomain<Ext>;

/*
<drop behavior> ::= CASCADE | RESTRICT
*/
type DropBehavior = 'Cascade' | 'Restrict';

/*
<drop schema statement> ::=
    DROP SCHEMA <schema name> <drop behavior>
*/
interface DropSchema<Ext extends Extension>
  extends Tagged<
    'DropSchema',
    {
      readonly name: QualifiedIdent;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropSchema'] | null;
    }
  > {}
const DropSchema = <Ext extends Extension>(args: UnTag<DropSchema<Ext>>): DropSchema<Ext> => tag('DropSchema', args);

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
      readonly extensions: Ext['AlterTable'] | null;
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
  | AlterColumn<Ext>
  | DropColumn<Ext>
  | AddTableConstraint<Ext>
  | DropTableConstraint<Ext>;

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
interface AlterColumn<Ext extends Extension>
  extends Tagged<
    'AlterColumn',
    {
      readonly name: Ident;
      readonly action: SetDefault<Ext> | DropDefault; // TODO check if there are common other actions in dialects
      readonly extensions: Ext['AlterColumn'] | null;
    }
  > {}
const AlterColumn = <Ext extends Extension>(args: UnTag<AlterColumn<Ext>>): AlterColumn<Ext> =>
  tag('AlterColumn', args);

/*
<drop column definition> ::=
  DROP [ COLUMN ] <column name> <drop behavior>
*/
interface DropColumn<Ext extends Extension>
  extends Tagged<
    'DropColumn',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropColumn'] | null;
    }
  > {}
const DropColumn = <Ext extends Extension>(args: UnTag<DropColumn<Ext>>): DropColumn<Ext> => tag('DropColumn', args);

/*
<add table constraint definition> ::=
  ADD <table constraint definition>
*/
interface AddTableConstraint<Ext extends Extension>
  extends Tagged<
    'AddTableConstraint',
    {
      readonly constraint: TableConstraint<Ext>;
      readonly extensions: Ext['AddTableConstraint'] | null;
    }
  > {}
const AddTableConstraint = <Ext extends Extension>(args: UnTag<AddTableConstraint<Ext>>): AddTableConstraint<Ext> =>
  tag('AddTableConstraint', args);

/*
<drop table constraint definition> ::=
  DROP CONSTRAINT <constraint name> <drop behavior>
*/
interface DropTableConstraint<Ext extends Extension>
  extends Tagged<
    'DropTableConstraint',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropTableConstraint'] | null;
    }
  > {}
const DropTableConstraint = <Ext extends Extension>(args: UnTag<DropTableConstraint<Ext>>): DropTableConstraint<Ext> =>
  tag('DropTableConstraint', args);

/*
<drop table statement> ::=
    DROP TABLE <table name> <drop behavior>
*/
interface DropTable<Ext extends Extension>
  extends Tagged<
    'DropTable',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropTable'] | null;
    }
  > {}
const DropTable = <Ext extends Extension>(args: UnTag<DropTable<Ext>>): DropTable<Ext> => tag('DropTable', args);

/*
<drop view statement> ::=
    DROP VIEW <table name> <drop behavior>
*/
interface DropView<Ext extends Extension>
  extends Tagged<
    'DropView',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropView'] | null;
    }
  > {}
const DropView = <Ext extends Extension>(args: UnTag<DropView<Ext>>): DropView<Ext> => tag('DropView', args);

/*
<revoke statement> ::=
  REVOKE [ GRANT OPTION FOR ] <privileges>
      ON <object name>
    FROM <grantee> [ { <comma> <grantee> }... ] <drop behavior>
*/
interface RevokePrivilege<Ext extends Extension>
  extends Tagged<
    'RevokePrivilege',
    {
      readonly privileges: Array<Privilege> | null;
      readonly objectName: Ident;
      readonly objectType: 'Table' | 'Domain' | 'Collation' | 'CharacterSet' | 'Translation';
      readonly grantees: Array<Ident> | null; // null means public
      readonly grantOption: boolean;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['RevokePrivilege'] | null;
    }
  > {}
const RevokePrivilege = <Ext extends Extension>(args: UnTag<RevokePrivilege<Ext>>): RevokePrivilege<Ext> =>
  tag('RevokePrivilege', args);

/*
<alter domain statement> ::=
    ALTER DOMAIN <domain name> <alter domain action>
*/
interface AlterDomain<Ext extends Extension>
  extends Tagged<
    'AlterDomain',
    {
      readonly name: Ident;
      readonly action: DomainAction<Ext>;
      readonly extensions: Ext['AlterDomain'] | null;
    }
  > {}
const AlterDomain = <Ext extends Extension>(args: UnTag<AlterDomain<Ext>>): AlterDomain<Ext> =>
  tag('AlterDomain', args);

/*
<alter domain action> ::=
      <set domain default clause>
    | <drop domain default clause>
    | <add domain constraint definition>
    | <drop domain constraint definition>
*/
type DomainAction<Ext extends Extension> =
  | SetDefault<Ext>
  | DropDefault
  | AddDomainConstraint<Ext>
  | DropDomainConstraint<Ext>;

/*
<set domain default clause> ::= SET <default clause>
*/
interface SetDefault<Ext extends Extension>
  extends Tagged<
    'SetDefault',
    {
      readonly default: DefaultOption;
      readonly extensions: Ext['SetDefault'] | null;
    }
  > {}
const SetDefault = <Ext extends Extension>(args: UnTag<SetDefault<Ext>>): SetDefault<Ext> => tag('SetDefault', args);

/*
<drop domain default clause> ::= DROP DEFAULT
*/
interface DropDefault extends Tagged<'DropDefault', {}> {}
const DropDefault: DropDefault = tag('DropDefault', {});

/*
<add domain constraint definition> ::=
  ADD <domain constraint>
*/
interface AddDomainConstraint<Ext extends Extension>
  extends Tagged<
    'AddDomainConstraint',
    {
      readonly constraint: ConstraintDefinition<CheckConstraint<Ext>, Ext>;
      readonly extensions: Ext['AddDomainConstraint'] | null;
    }
  > {}
const AddDomainConstraint = <Ext extends Extension>(args: UnTag<AddDomainConstraint<Ext>>): AddDomainConstraint<Ext> =>
  tag('AddDomainConstraint', args);

/*
<drop domain constraint definition> ::=
  DROP CONSTRAINT <constraint name>
*/
interface DropDomainConstraint<Ext extends Extension>
  extends Tagged<
    'DropDomainConstraint',
    {
      readonly name: Ident;
      readonly extensions: Ext['DropDomainConstraint'] | null;
    }
  > {}
const DropDomainConstraint = <Ext extends Extension>(
  args: UnTag<DropDomainConstraint<Ext>>,
): DropDomainConstraint<Ext> => tag('DropDomainConstraint', args);

/*
<drop domain statement> ::=
  DROP DOMAIN <domain name> <drop behavior>
*/
interface DropDomain<Ext extends Extension>
  extends Tagged<
    'DropDomain',
    {
      readonly name: Ident;
      readonly behavior: DropBehavior;
      readonly extensions: Ext['DropDomain'] | null;
    }
  > {}
const DropDomain = <Ext extends Extension>(args: UnTag<DropDomain<Ext>>): DropDomain<Ext> => tag('DropDomain', args);

/*
<drop assertion statement> ::=
  DROP ASSERTION <constraint name>
*/
interface DropAssertion<Ext extends Extension>
  extends Tagged<
    'DropAssertion',
    {
      readonly name: Ident;
      readonly extensions: Ext['DropAssertion'] | null;
    }
  > {}
const DropAssertion = <Ext extends Extension>(args: UnTag<DropAssertion<Ext>>): DropAssertion<Ext> =>
  tag('DropAssertion', args);

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
  DropDomainConstraint,
};
