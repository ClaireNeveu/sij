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

Idents need to be boxed so they can be distinguised from strings in updates and inserts.

Wonder if it might be better to modify the base builder prototype instead of parameterization e.g.

```
declare module 'zod' {
    export interface ZodType {
        makeOptional: (required: boolean)=> ZodType;
    }
}
// Add syntaxic sugar to the Zod schema
z.ZodType.prototype.makeOptional = function (required: boolean): ZodType {
    return required ? this : this.optional();
};
```

Also wonder if I might be able to _clone_ the module then modify the clone. That would allow the types to actually be accurate.
