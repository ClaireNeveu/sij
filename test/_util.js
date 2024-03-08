'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isParamsSql = exports.isSqls = exports.isSql = void 0;
var ava_1 = require('ava');
var render_1 = require('../src/render');
var r = new render_1.Renderer();
var isSql = ava_1.default.macro(function (t, builder, out) {
  return t.is(r.renderStatement(builder._statement), out);
});
exports.isSql = isSql;
var isSqls = ava_1.default.macro(function (t, builder, out) {
  return t.deepEqual(
    builder._statements.map(function (s) {
      return r.renderStatement(s);
    }),
    out,
  );
});
exports.isSqls = isSqls;
var isParamsSql = ava_1.default.macro(function (t, builder, str, par) {
  var r = new render_1.Renderer({ paramsMode: true });
  var q = r.renderStatement(builder._statement);
  var params = r.params;
  t.is(q, str);
  t.deepEqual(params, par);
});
exports.isParamsSql = isParamsSql;
