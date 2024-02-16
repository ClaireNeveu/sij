
/*
<SQL schema manipulation statement> ::=
    <drop schema statement>
  | <alter table statement>
  | <drop table statement>
  | <drop view statement>
  | <revoke statement>
  | <alter domain statement>
  | <drop domain statement>
  | <drop character set statement>
  | <drop collation statement>
  | <drop translation statement>
  | <drop assertion statement>
*/ 
type SchemaManipulationStatement = never

export { SchemaManipulationStatement }