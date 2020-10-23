
## Selecting

Selecting columns is as easy as calling `sql.from('my_table').select('col1', 'col2')`. You can call select as many times as you like; each time simply adds columns to the selection. These two are equivalent: `.select('col1', 'col2')`, `.select('col1').select('col2')`.

As with regular SQL you can select qualified identifiers like `my_table.col` and expressions like `UPPERCASE(col)`. Because of the limitations of typescript, you do need to separate columsn and expressions into different `.select`s. E.g. to write `SELECT col1, my_table.col2, UPPERCASE(col3) as upper_col3 FROM my_table` you would write
```typescript
sql.from('my_table').select('col1', 'my_table.col2').selectAs('upper_col3', sql.upperCase(`col3))
```
If you write that as a single `.select` you will get a type error.^1

### Sub-Builder Syntax

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

### Joins

Joins make use of sub-builders to provide context for the `ON` clause. So to perform a simple join you would do:
```typescript
sql.from('my_table')
   .join('other_table', sql => sql.fn.eq('my_table.col', 'other_table.col'))
   .select('my_table.col', 'my_table.col2', 'other_table.col2')
```
Here `other_table` will be available to the `eq` functions in the join clause.

If you're using javascript without typescript, you can omit the sub-builder and simply do
```javascript
sql.from('my_table')
   .join('other_table', sql.fn.eq('my_table.col', 'other_table.col'))
   .select('my_table.col', 'my_table.col2', 'other_table.col2')
```

#### Derived Tables

To join on a derived table, just alias another builder and pass it into the `join` method in lieu of a table name:
```typescript
sql.from('employee').leftJoin(
  sql.as('t1', b.from('department').select('id', 'budget')),
  sql => sql.fn.eq('t1.id', 'employee.department_id')
).select('name', 't1.budget')
```

### Where Clause

The `where` method will accept any SQL expression that evaluates to a boolean. Usually this means a function like so:
```typescript
sql.from('my_table').select('col', 'col2')(sql => sql.where(sql.fn.gt('col3', sql.lit(5))))
// SELECT "col", "col2" FROM "my_table" WHERE "col3" > 5
```
Multiple invocations of `where` will be combined with `AND`.
```typescript
sql.from('my_table').select('col', 'col2')(sql => 
  sql.where(sql.fn.gt('col3', sql.lit(5)))
     .where(sql.fn.lt('col3', sql.lit(50)))
)
// SELECT "col", "col2" FROM "my_table" WHERE "col3" > 5 AND "col3" < 50
```
If you need to `OR` the clauses together use `sql.fn.or`
```typescript
sql.from('my_table').select('col', 'col2')(sql => 
  sql.where(sql.fn.or(sql.fn.lt('col3', sql.lit(5)), sql.fn.gt('col3', sql.lit(50))))
)
// SELECT "col", "col2" FROM "my_table" WHERE "col3" < 5 OR "col3" > 50
```
When you only need to test equality you can use the shorthand syntax:
```typescript
sql.from('my_table').select('col', 'col2').where({
  col3: 5,
  col4: 'foo',
})
// SELECT "col", "col2" FROM "my_table" WHERE "col3" = 5 AND "col4" = 'foo'
```

## Differences from SQL

Although SIJ aims to be just "SQL in Javascript", it makes a few changes to increase type-safety. None of these changes reduce the expressiveness of the language but they might require you to write your SQL in a slightly different manner than you would otherwise.

### FROM SELECT

The order of FROM and SELECT are reversed in SIJ. Instead of `SELECT * FROM my_table` in SIJ you would write `sql.from('my_table').select('*')`. In the rare case that you need to perform a select without referencing a table you can omit the table when you call `.from`. E.g. `sql.from().select(sql.as('col', sql.plus(1, 1)))` becomes `SELECT 1 + 1 AS col`.

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

## Limitations

SQL does not allow selects where columns are ambiguous. This occurs in joins when both tables have a column with the same, e.g.
```sql
CREATE TABLE my_table (
  id bigint,
  name text,
  other_table_id bigint
);

CREATE TABLE other_table (
  id bigint,
  name text,
);

SELECT name FROM my_table LEFT JOIN other_table ON my_table.other_table_id = other_table.id;
```
`name` in this query is ambiguous and SQL will reject the query. Sij however will not prevent you from constructing this query because it has no knowledge of conflicting columns.

1. This is because we need to narrow the arguments' sum type to one variant in order to extract the return type.
