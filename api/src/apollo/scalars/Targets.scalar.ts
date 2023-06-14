import { UserInputError } from '@nestjs/apollo';
import { Address, asAddress, asSelector, Selector, Targets } from 'lib';
import { createScalar } from './util';
import { parseLiteral } from './parseLiteral';

const parseValue = (value: unknown): Targets => {
  if (value === null || typeof value !== 'object') throw new UserInputError('Must be an object');

  return Object.entries(value).reduce(
    (targets, [toInput, selectorsInput]) => {
      if (!Array.isArray(selectorsInput))
        throw new UserInputError('Target selectors must be an array');

      return {
        ...targets,
        [toInput === '*' ? toInput : asAddress(toInput)]: new Set(
          selectorsInput.map((s) => (s === '*' ? '*' : asSelector(s))),
        ),
      };
    },
    { '*': new Set([]) },
  );
};

// TODO: use this for targets
// export const [TargetsScalar, TargetsField] = createScalar<TargetPermission, Record<Address | '*', (Selector | '*')[]>>({
//   name: 'Targets',
//   description: 'Targets permission',
//   serialize: (value) => value as any, // TODO: make Targets use only JSON i.e. no Sets
//   parseValue,
//   parseLiteral: (ast, variables) => parseValue(parseLiteral(ast, variables)),
// });
