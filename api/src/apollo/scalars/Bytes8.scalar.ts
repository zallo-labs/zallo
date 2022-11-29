import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = '8-byte string';

const isBytes8 = (v: unknown): v is BytesLike => ethers.utils.isHexString(v, 8);

const parse = (value: unknown): BytesLike => {
  if (!isBytes8(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

export const [Bytes8Scalar, Bytes8Field] = createScalar<BytesLike, string>({
  name: 'Bytes8',
  description,
  serialize: (value) => ethers.utils.hexlify(value as BytesLike),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw new UserInputError('Must be a string');
  },
});
