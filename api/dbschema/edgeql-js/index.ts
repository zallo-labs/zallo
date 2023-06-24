// GENERATED by @edgedb/generate v0.3.0
// Run 'npx @edgedb/generate edgeql-js' to re-generate

export * from "./external";
export { createClient } from "edgedb";
import * as $ from "./reflection";
import * as $syntax from "./syntax";
import * as $op from "./operators";
import _std from "./modules/std";
import _cal from "./modules/cal";
import _cfg from "./modules/cfg";
import _schema from "./modules/schema";
import _sys from "./modules/sys";
import _math from "./modules/math";
import _default from "./modules/default";

const ExportDefault: typeof _std & 
  typeof _default & 
  $.util.OmitDollarPrefixed<typeof $syntax> & 
  typeof $op & {
  "std": typeof _std;
  "cal": typeof _cal;
  "cfg": typeof _cfg;
  "schema": typeof _schema;
  "sys": typeof _sys;
  "math": typeof _math;
  "default": typeof _default;
} = {
  ..._std,
  ..._default,
  ...$.util.omitDollarPrefixed($syntax),
  ...$op,
  "std": _std,
  "cal": _cal,
  "cfg": _cfg,
  "schema": _schema,
  "sys": _sys,
  "math": _math,
  "default": _default,
};
const Cardinality = $.Cardinality;
type Cardinality = $.Cardinality;
export type Set<
  Type extends $.BaseType,
  Card extends $.Cardinality = $.Cardinality.Many
> = $.TypeSet<Type, Card>;


export default ExportDefault;
export { Cardinality };
