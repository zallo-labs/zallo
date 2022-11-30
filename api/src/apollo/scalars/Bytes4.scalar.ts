import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = '4-byte hex string';

const isBytes4 = (v: unknown): v is BytesLike => ethers.utils.isHexString(v, 4);

const parse = (value: unknown): BytesLike => {
  if (!isBytes4(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

export const [Bytes4Scalar, Bytes4Field] = createScalar<BytesLike, string>({
  name: 'Bytes4',
  description,
  serialize: (value) => ethers.utils.hexlify(value as BytesLike),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw new UserInputError('Must be a string');
  },
});
