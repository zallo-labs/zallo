import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { asHex, Hex, isHex, bytesize } from 'lib';
import { createScalar } from './util';

const parse = (value: unknown, len?: number): Hex => {
  try {
    if (!(isHex(value) && (len === undefined || bytesize(value) === len)))
      throw new UserInputError(`Provided value is not a bytes hex string`);

    return value;
  } catch (e) {
    throw new UserInputError((e as Error).message);
  }
};

const createBytesScalar = (name: string, description: string, len?: number) =>
  createScalar<Hex, string>({
    name,
    description,
    serialize: (value) => asHex(value as string),
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
