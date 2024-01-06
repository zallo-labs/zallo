import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';

import { isUUID, UUID } from 'lib';
import { createScalar } from './util';

const description = 'UUID';

const parseValue = (value: unknown): UUID => {
  if (!isUUID(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

export const [UUIDScalar, UUIDField] = createScalar<UUID, string>({
  name: 'UUID',
  description,
  serialize: (v) => v,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
  specifiedByURL: 'https://en.wikipedia.org/wiki/Universally_unique_identifier',
});
