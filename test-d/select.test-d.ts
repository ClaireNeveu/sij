import { expectError, expectType } from 'tsd';
import { Builder } from '../src/builder';
import { NoBuilderExtension } from '../src/builder/util';

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
const a1: { name: string } = b.from('employee').select('name').__testingGet()
expectError(() => {
    const a1: { name: number } = b.from('employee').select('name').__testingGet()
})

// Should return correct types for wildcard selects
const a8: { name: string, id: number } = b.from('employee').select('*').__testingGet()
expectError(() => {
    const a1: { name: number, id: number } = b.from('employee').select('*').__testingGet()
})

// Should return correct types for multi selects
const a2: { name: string, id: number } = b.from('employee').select('name', 'id').__testingGet()
expectError(() => {
    const a2: { name: boolean, id: boolean } = b.from('employee').select('name', 'id').__testingGet()
})

// Should return correct types for multi selects #2
const a3: { name: string, id: number } = b.from('employee').select('name').select('id').__testingGet()
expectError(() => {
    const a2: { name: boolean, id: boolean } = b.from('employee').select('name').select('id').__testingGet()
})

// Extra properties are not left around
expectError(() => {
    const a2: { name: string, id: number } = b.from('employee').select('name').__testingGet()
})
expectError(() => {
    const a2: { name_length: number, name: string } = b.from('employee')(b1 => b1.selectExpr(b.as('name_length', b1.fn.charLength('name')))).__testingGet()
})

// Should return correct types for qualified selects
const a4: { name: string, id: number } = b.from('employee').select('employee.name', 'id').__testingGet()
expectError(() => {
    const a4: { name: boolean, id: number } = b.from('employee').select('employee.name', 'id').__testingGet()
})

// Should disallow qualified selects for the wrong table
expectError(b.from('employee').select('department.id', 'name'))

// SelectAs shouldn't wreck type inference
expectError(b.from('employee').select('id', 'name')(b => b.selectAs('name_length', b.fn.charLength('name'))).where({ fid: 5 }))
expectError(b.from('employee').select('id', 'name').selectAs('name_length', 'name').where({ fid: 5 }))

// Should return correct types for aliased functions
const a5: { name_length: number } = b.from('employee')(b => b.selectAs('name_length', b.fn.charLength('name'))).__testingGet()
const a7: { name_length: number } = b.from('employee')(b1 => b1.select(b.as('name_length', b1.fn.charLength('name')))).__testingGet()
const a6: { name_length: number } = b.from('employee')(b1 => b1.selectExpr(b.as('name_length', b1.fn.charLength('name')))).__testingGet()
expectError(() => {
    const a5: { name_length: string } = b.from('employee')(b => b.selectAs('name_length', b.fn.charLength('name'))).__testingGet()
})
