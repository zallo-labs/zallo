import { UserInputError } from 'apollo-server-core';
import { Kind } from 'graphql';
import { MAX_UINT256, MIN_UINT256 } from 'lib';
import { createScalar } from './util';

const parse = (value: unknown, description: string, min?: bigint, max?: bigint): bigint => {
  if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'bigint')
    throw new UserInputError('Must be number, string, or bigint');

  const v = BigInt(value);
  if (max && v > max) throw new UserInputError(`Must be less than or equal to ${max}`);

  return v;
};

const createBigIntScalar = (name: string, description: string, min?: bigint, max?: bigint) =>
  createScalar<bigint, bigint>({
    name,
    description,
    serialize: (value) => value as bigint,
    parseValue: (value: unknown) => parse(value, description, min, max),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT)
        return parse(ast.value, description, max);
      throw new UserInputError('Must be a string or integer');
    },
  });

export const [Uint256Scalar, Uint256Field] = createBigIntScalar(
  'Uint256',
  '256-bit unsigned integer',
  MIN_UINT256,
  MAX_UINT256,
);
