
## Selecting

Selecting columns is as easy as calling `sql.from('my_table').select('col1', 'col2')`. You can call select as many times as you like; each time simply adds columns to the selection. These two are equivalent: `.select('col1', 'col2')`, `.select('col1').select('col2')`.

As with regular SQL you can select qualified identifiers like `my_table.col` and expressions like `UPPERCASE(col)`. Because of the limitations of typescript, you do need to separate columsn and expressions into different `.select`s. E.g. to write `SELECT col1, my_table.col2, UPPERCASE(col3) as upper_col3 FROM my_table` you would write
```typescript
sql.from('my_table').select('col1', 'my_table.col2').selectAs('upper_col3', sql.upperCase(`col3))
```
If you write that as a single `.select` you will get a type error.^1

## Sub-Builder Syntax

Because of Typescript's (mostly) unidirectional type inference, everything in SIJ is attached to a fluent builder to avoid repetitive type annotations. This can be cumbersome when constructing complicated queries, especially those that involve functions. Take for example the following rather simple query:
```typescript
const sql1 = sql.from('my_table');
sql1.selectAs('pos_col', sql1.fn.abs('col'));
```
We have to introduce the intermediate value `sql1` so that our `ABS` function knows about the available columns. SIJ provides a convenient syntax to work around this limitation which leverages Typescript's limited contextual typing:
```typescript
sql.from('my_table')(sql => sql.selectAs('pos_col', sql.fn.abs('col'));
```
You can call any builder as a function to get a locally scoped version of the query built up to that point.

## Differences from SQL

Although SIJ aims to be just "SQL in Javascript", it makes a few changes to increase type-safety. None of these changes reduce the expressiveness of the language but they might require you to write your SQL in a slightly different manner than you would otherwise.

### FROM SELECT

The order of FROM and SELECT are reversed in SIJ. Instead of `SELECT * FROM my_table` in SIJ you would write `sql.from('my_table').select('*')`. In the rare case that you need to perform a select without referencing a table you can select from the table "_NO_TABLE_". E.g. `sql.from('_NO_TABLE').select(sql.as('col', sql.plus(1, 1)))` becomes `SELECT 1 + 1 AS col`.

Similarly, if you want to select from columns on a join, you need to order the join _before_ the selections as below:
```typescript
sql.from('my_table')(sql => sql.leftJoin('other_table', sql.fn.eq('my_table.foo', 'other_table.foo')))
  .select('my_table.col', 'other_table.col2')
```
Ordering it the other way will produce a valid query, but typescript will complain that `other_table.col2` does not exist.

### Bare Expressions in Selects

Sij does not allow you to select an expression without aliasing it. In raw SQL it's possible to query `SELECT col + 1 from my_table` and get back an object that looks like `{ 'col + 1': 5 }`. Because the names of expression columns are not always statically determinable, sij forces you to alias any expressions you want to select. You can do this with `sql.as`, e.g. `sql.from('my_table').select(sql.as('col_plus_one', sql.fn.plus('col', sql.lit(1))))`

As a convenient shorthand you can use the `selectAs` builder method:
```typescript
sql.from('my_table').selectAs('my_alias', sql.fn.sum('col'))
// SELECT SUM(col) AS my_alias FROM my_table
```


1. This is because we need to narrow the arguments' sum type to one variant in order to extract the return type.
