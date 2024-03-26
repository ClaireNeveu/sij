- Need a way to accomodate non-primitive values. When used in params mode the db connector can convert complex types to primitive values. Basic functionality should work out of the box but functions are typed specifically to primitive types. A specific example of this might look like this:

```typescript
type Natural = ...
type MySchema = {
  myTable: {
    id: BigInt,
    col: Natural,
  },
};
```

The database connector might convert this into a numeric type which means that you can use `+`, `-`, etc. but the functions on the builder won't work on `Natural` because they're specialized. Type-classes would be useful here but requiring users to manually pass a type class instance would be annoying and at that point you might as well do `sql.unTyped().fn.add(...)`.

```
// Pre-compile
const query: PrecompiledQuery<[number, number]> = sql.from('my_table')
  .select('*')
  .where({ foo: sql.placeholder<number>()})(sql => 
    sql.where(sql.fn.gt('bar', sql.placeholder<number>()))
  ).compile();

// String interface
const PrecompiledQuery<[number, number]> = 'SELECT * FROM my_table WHERE foo = $number AND bar > $number'

```

# Documentation Notes

## Security
1. Never query against your SQL database using `renderAsString`. Queries rendered this way have all literals embedded directly into them and are not escaped. (maybe I should just include escaping by default). Pass the query to the client directly or use `renderAsStringAndArgs`.
2. Do not use user input except as literals. SIJ cannot protect you against SQL injection if you allow users to define arbitrary parts of your query like function names. (maybe I should provide an `interpolate` function that allows you to pull out any arbitrary part of the query.)