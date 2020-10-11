import { expectError, expectType } from 'tsd';
import { Builder } from '../src/builder';
import { NoExtension } from '../src/ast/util';

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

const b = new Builder<MySchema, NoExtension>();

// Should error on bad tables
expectError(b.from('no_table'))

// Should error on bad columns
expectError(b.from('employee').select('badColumn'))

// Should return correct types for simple selects
const a1: { name: string } = b.from('employee').select('name').__testingGet()

// Should return correct types for multi selects
const a2: { name: string, id: number } = b.from('employee').select('name', 'id').__testingGet()

// Should return correct types for multi selects #2
const a3: { name: string, id: number } = b.from('employee').select('name').select('id').__testingGet()

// Should return correct types for qualified selects
const a4: { name: string, id: number } = b.from('employee').select('employee.name', 'id').__testingGet()

// Should disallow qualified selects for the wrong table
expectError(b.from('employee').select('department.id', 'name'))

// SelectAs shouldn't wreck type inference
expectError(b.from('employee').select('id', 'name')(b => b.selectAs('name_length', b.fn.charLength('name'))).where({ fid: 5 }))
expectError(b.from('employee').select('id', 'name').selectAs('name_length', 'name').where({ fid: 5 }))

