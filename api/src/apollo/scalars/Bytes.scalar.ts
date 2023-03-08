import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { Kind } from 'graphql';
import { asHexString, HexString, isHexString } from 'lib';
import { createScalar } from './util';

const parse = (value: unknown, len?: number): HexString => {
  try {
    if (!isHexString(value)) throw new UserInputError(`Provided value is not a bytes hex string`);

    return asHexString(value, len);
  } catch (e) {
    throw new UserInputError((e as Error).message);
  }
};

const createBytesScalar = (name: string, description: string, len?: number) =>
  createScalar<HexString, string>({
    name,
    description,
    serialize: (value) => ethers.utils.hexlify(value as BytesLike),
    parseValue: (value) => parse(value, len),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.STRING) return parse(ast.value, len);
      throw new UserInputError('Must be a string');
    },
  });

export const [BytesScalar, BytesField] = createBytesScalar('Bytes', 'bytes hex string');

export const [Bytes4Scalar, Bytes4Field] = createBytesScalar('Bytes4', '4-byte hex string', 4);
export const [SelectorScalar, SelectorField] = createBytesScalar(
  'Selector',
  'function selector (4-byte hex string)',
  4,
);

export const [Bytes32Scalar, Bytes32Field] = createBytesScalar('Bytes32', '32-byte hex string', 32);
