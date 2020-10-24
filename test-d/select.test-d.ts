import { expectError, expectType } from 'tsd';
import { Builder } from '../src/builder';
import { NoBuilderExtension, TypeTag } from '../src/builder/util';

type MySchema = {
    employee: {
        id: number,
        name: string,
    },
    department: {
        id: number,
        budget: number,
    },
};

const b = new Builder<MySchema, NoBuilderExtension>();

// Should error on bad tables
expectError(b.from('no_table'))

// Should error on bad columns
expectError(b.from('employee').select('badColumn'))

// Should return correct types for simple selects
const a1: TypeTag<{ name: string }> = b.from('employee').select('name').returnTag()
expectError(() => {
    const a1: TypeTag<{ name: number }> = b.from('employee').select('name').returnTag()
})

// Should return correct types for wildcard selects
const a8: TypeTag<{ name: string, id: number }> = b.from('employee').select('*').returnTag()
expectError(() => {
    const a1: TypeTag<{ name: number, id: number }> = b.from('employee').select('*').returnTag()
})

// Should return correct types for multi selects
const a2: TypeTag<{ name: string, id: number }> = b.from('employee').select('name', 'id').returnTag()
expectError(() => {
    const a2: TypeTag<{ name: boolean, id: boolean }> = b.from('employee').select('name', 'id').returnTag()
})

// Should return correct types for multi selects #2
const a3: TypeTag<{ name: string, id: number }> = b.from('employee').select('name').select('id').returnTag()
expectError(() => {
    const a2: TypeTag<{ name: boolean, id: boolean }> = b.from('employee').select('name').select('id').returnTag()
})

// Extra properties are not left around
expectError(() => {
    const a2: TypeTag<{ name: string, id: number }> = b.from('employee').select('name').returnTag()
})
expectError(() => {
    const a2: TypeTag<{ name_length: number, name: string }> = b.from('employee')(b1 => b1.selectExpr(b.as('name_length', b1.fn.charLength('name')))).returnTag()
})

// Should return correct types for qualified selects
const a4: TypeTag<{ name: string, id: number }> = b.from('employee').select('employee.name', 'id').returnTag()
expectError(() => {
    const a4: TypeTag<{ name: boolean, id: number }> = b.from('employee').select('employee.name', 'id').returnTag()
})

// Should disallow qualified selects for the wrong table
expectError(b.from('employee').select('department.id', 'name'))

// SelectAs shouldn't wreck type inference
expectError(b.from('employee').select('id', 'name')(b => b.selectAs('name_length', b.fn.charLength('name'))).where({ fid: 5 }))
expectError(b.from('employee').select('id', 'name').selectAs('name_length', 'name').where({ fid: 5 }))

// Should return correct types for aliased functions
const a5: TypeTag<{ name_length: number }> =
    b.from('employee')(b => b.selectAs('name_length', b.fn.charLength('name'))).returnTag()
const a7: TypeTag<{ name_length: number }> =
    b.from('employee')(b1 => b1.select(b.as('name_length', b1.fn.charLength('name')))).returnTag()
const a6: TypeTag<{ name_length: number }> =
    b.from('employee')(b1 => b1.selectExpr(b.as('name_length', b1.fn.charLength('name')))).returnTag()
expectError(() => {
    const a5: TypeTag<{ name_length: string }> = b.from('employee')(b => b.selectAs('name_length', b.fn.charLength('name'))).returnTag()
})

// Should disallow columns of incorrect type in functions
expectError(b.from('employee')(b => b.selectAs('foo', b.fn.pos('name'))));
b.from('employee')(b => b.selectAs('foo', b.fn.pos('id')))
