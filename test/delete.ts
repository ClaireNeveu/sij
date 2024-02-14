import test, { Macro } from 'ava';

import { Builder, QueryBuilder } from '../src/builder';
import { Functions } from '../src/builder/functions';
import { NoBuilderExtension, Extend, StatementBuilder } from '../src/builder/util';
import { Renderer } from '../src/render';

import { isSql, isParamsSql } from './_util';

type MySchema = {
    employee: {
        id: number,
        name: string,
        salary: number,
        department_id: number
    },
    department: {
        id: number,
        budget: number,
    },
};

const realNumber: { _tag: 'Real', val: string } = ({ _tag: 'Real', val: '5000' })

type MyExtension = Extend<{
    builder: {
        types: {
            numeric: number | bigint | { _tag: 'Real', val: string },
        }
    }
}>;

const b = new Builder<MySchema, MyExtension>(new Functions<MySchema, {}, MyExtension>());

test('basic', isSql,
     b.deleteFrom('employee'),
     'DELETE FROM "employee"',
    );

test('with where', isSql,
     b.deleteFrom('employee')(b => b.where(b.fn.greaterThan('id', b.lit(5)))),
     'DELETE FROM "employee" WHERE "id" > 5',
    );

test('with where shorthand', isSql,
     b.deleteFrom('employee').where({ id: 5 }),
     'DELETE FROM "employee" WHERE "id" = 5',
    );
