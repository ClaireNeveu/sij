import { Ident, Lit } from './expr';
import { Tagged, UnTag, tag } from './util';

/*
<SQL connection statement> ::=
  <connect statement>
  | <set connection statement>
  | <disconnect statement>
*/
type ConnectionStatement = ConnectStatement | SetConnectionStatement | DisconnectStatement;

/*
<connect statement> ::=
  CONNECT TO <connection target>

<connection target> ::=
    <SQL-server name>
      [ AS <connection name> ]
      [ USER <user name> ]
  | DEFAULT
*/
interface ConnectStatement
  extends Tagged<
    'ConnectStatement',
    {
      readonly server: Ident | null; // null means DEFAULT
      readonly alias: Ident | null;
      readonly user: Ident | null;
    }
  > {}
const ConnectStatement = (args: UnTag<ConnectStatement>): ConnectStatement => tag('ConnectStatement', args);

/*
<set connection statement> ::=
  SET CONNECTION <connection object>

<connection object> ::=
    DEFAULT
  | <connection name>

<connection name> ::= <simple value specification>

<simple value specification> ::=
  <parameter name>
  | <embedded variable name>
  | <literal>

<parameter name> ::= <colon> <identifier>

<embedded variable name> ::=
  <colon><host identifier>
*/
interface SetConnectionStatement
  extends Tagged<
    'SetConnectionStatement',
    {
      readonly connection: Ident | Lit | null; // null means DEFAULT
    }
  > {}
const SetConnectionStatement = (args: UnTag<SetConnectionStatement>): SetConnectionStatement =>
  tag('SetConnectionStatement', args);

/*
<disconnect statement> ::=
  DISCONNECT <disconnect object>

<disconnect object> ::=
    <connection object>
  | ALL
  | CURRENT
*/
interface DisconnectStatement
  extends Tagged<
    'DisconnectStatement',
    {
      readonly connection: Ident | Lit | 'All' | 'Current';
    }
  > {}
const DisconnectStatement = (args: UnTag<DisconnectStatement>): DisconnectStatement => tag('DisconnectStatement', args);

export { ConnectionStatement, ConnectStatement, SetConnectionStatement, DisconnectStatement };
