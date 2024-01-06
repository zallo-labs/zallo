import { ConstraintViolationError } from 'edgedb';

import { isTruthy } from 'lib';
import e from '~/edgeql-js';
import { orScalarLiteral } from '~/edgeql-js/castMaps';
import { $bool } from '~/edgeql-js/modules/std';
import { ObjectTypeSet, TypeSet } from '~/edgeql-js/reflection';

export const and = (<Op extends orScalarLiteral<TypeSet<$bool>>>() => {
  const chain = (ops: Op[]) => {
    if (ops.length === 0) return undefined;
    if (ops.length === 1) return ops[0];

    return e.op(ops[0], 'and', chain(ops.slice(1)));
  };

  return (...ops: (Op | undefined)[]) => chain(ops.filter(isTruthy));
})();

export const or = (<Op extends orScalarLiteral<TypeSet<$bool>>>() => {
  const chain = (ops: Op[]) => {
    if (ops.length === 0) return undefined;
    if (ops.length === 1) return ops[0];

    return e.op(ops[0], 'or', chain(ops.slice(1)));
  };

  return (...ops: (Op | undefined)[]) => chain(ops.filter(isTruthy));
})();

export const makeUnionTypeResolver = (mappings: [ObjectTypeSet, unknown][] = []) => {
  const typenameMappings = Object.fromEntries(
    mappings.map(([type, r]) => [type.__element__.__name__, r] as const),
  );

  return function resolveUnionType(value: unknown) {
    if (typeof value !== 'object' || !value) return undefined;

    // EdgeDB module name, e.g. default::Proposal
    const typename =
      '__type__' in value &&
      typeof value.__type__ === 'object' &&
      value.__type__ &&
      'name' in value.__type__ &&
      value.__type__.name;
    if (typeof typename === 'string') return typenameMappings[typename] || typename.split('::')[1];

    // // GraphQL returned type
    if (
      '__proto__' in value &&
      typeof value.__proto__ === 'object' &&
      value.__proto__ &&
      value.__proto__.constructor !== Object
    )
      return value.__proto__.constructor;

    // return undefined; // Error
  };
};

export function isExclusivityConstraintViolation(e: unknown): e is ConstraintViolationError {
  return e instanceof ConstraintViolationError && e.message.includes('exclusivity');
}
