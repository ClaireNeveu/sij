import test, { Macro } from 'ava';

import { NoBuilderExtension, Extend, StatementBuilder, MultiStatementBuilder } from '../src/builder/util';
import { Renderer } from '../src/render';

const r = new Renderer();

const isSql: Macro<[StatementBuilder<any>, string]> = test.macro((t, builder, out) =>
  t.is(r.renderStatement(builder._statement), out),
);

const isSqls: Macro<[MultiStatementBuilder<any>, Array<string>]> = test.macro((t, builder, out) =>
  t.deepEqual(
    builder._statements.map(s => r.renderStatement(s)),
    out,
  ),
);

const isParamsSql: Macro<[StatementBuilder<any>, string, Array<any>]> = test.macro((t, builder, str, par) => {
  const r = new Renderer({ paramsMode: true });
  const q = r.renderStatement(builder._statement);
  const { params } = r;
  t.is(q, str);
  t.deepEqual(params, par);
});

export { isSql, isSqls, isParamsSql };
