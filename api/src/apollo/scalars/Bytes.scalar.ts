import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = 'bytes hex string';

const isBytes = (v: unknown): v is BytesLike => ethers.utils.isHexString(v);

const parse = (value: unknown): BytesLike => {
  if (!isBytes(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

export const [BytesScalar, BytesField] = createScalar<BytesLike, string>({
  name: 'Bytes',
  description,
  serialize: (value) => ethers.utils.hexlify(value as BytesLike),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw new UserInputError('Must be a string');
  },
});
