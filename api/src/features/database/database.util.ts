import { ObjectTypeSet, TypeSet } from '~/edgeql-js/reflection';
import e from '~/edgeql-js';
import { isTruthy } from 'lib';
import { orScalarLiteral } from '~/edgeql-js/castMaps';
import { $bool } from '~/edgeql-js/modules/std';

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

  return function resolveUnionType(value: any) {
    const typename = value.__type__?.name; // Includes module name, e.g. default::Proposal

    return typenameMappings[typename] || typename.split('::')[1];
  };
};
