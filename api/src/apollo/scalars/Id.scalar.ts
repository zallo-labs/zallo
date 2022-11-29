import { UserInputError } from 'apollo-server-core';
import { Id, toId } from 'lib';
import { createScalar } from './util';

const description = 'Identifier';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): Id => {
  if (typeof value !== 'string' || typeof value['toString'] !== 'function') throw error;
  return toId(`${value}`);
};

export const [IdScalar, IdField] = createScalar<Id, string>({
  name: 'Id',
  description,
  serialize: (value) => value as Id,
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if ('value' in ast) return parse(ast.value);
    throw error;
  },
});
