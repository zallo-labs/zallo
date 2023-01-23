import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { hexDataLength } from 'ethers/lib/utils';
import { Kind } from 'graphql';
import { createScalar } from './util';

const isBytes = (v: unknown): v is BytesLike => ethers.utils.isHexString(v);

const parse = (value: unknown, len?: number): BytesLike => {
  if (!isBytes(value)) throw new UserInputError(`Provided value is not a bytes hex string`);
  if (len !== undefined && hexDataLength(value) !== len)
    throw new UserInputError(`Must have length ${len}`);

  return value;
};

const createBytesScalar = (name: string, description: string, len?: number) =>
  createScalar<BytesLike, string>({
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

export const [Bytes4Scalar, Bytes4Field] = createBytesScalar('Bytes4', '4-byte hex string');

export const [Bytes8Scalar, Bytes8Field] = createBytesScalar('Bytes8', '8-byte hex string');

export const [Bytes32Scalar, Bytes32Field] = createBytesScalar('Bytes32', '32-byte hex string');
