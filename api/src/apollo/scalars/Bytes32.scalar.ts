import { UserInputError } from 'apollo-server-core';
import { ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = '32-byte string';

const isBytes32 = (v: unknown): v is string => ethers.utils.isHexString(v, 32);

const parseValue = (value: unknown): string => {
  if (!isBytes32(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

export const [Bytes32Scalar, Bytes32Field] = createScalar<string, string>({
  name: 'Bytes32',
  description,
  serialize: (value) => value as string,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
});
