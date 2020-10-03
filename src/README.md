

## Differences from SQL

Although SIJ aims to be just "SQL in Javascript", it makes a few changes to increase type-safety. None of these changes reduce the expressiveness of the language but they might require you to write your SQL in a slightly different manner than you would otherwise.

### FROM SELECT

The order of FROM and SELECT are reversed in SIJ. Instead of `SELECT * FROM my_table` in SIJ you would write `sql.from('my_table').select('*')`. In the rare case that you need to perform a select without referencing a table you can select from the table "_NO_TABLE_". E.g. `sql.from('_NO_TABLE').select(sql.as('col', sql.plus(1, 1)))` becomes `SELECT 1 + 1 AS col`.

### Bare Expressions in Selects

Sij does not allow you to select an expression without aliasing it. In raw SQL it's possible to query `SELECT col + 1 from my_table` and get back an object that looks like `{ 'col + 1': 5 }`. Because the names of expression columns are not always statically determinable, sij forces you to alias any expressions you want to select. You can do this with `sql.as`, e.g. `sql.from('my_table').select(sql.as('col_plus_one', sql.plus('col', lit(1))))`