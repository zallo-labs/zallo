import { BigNumberish, isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { UserInputError } from 'apollo-server-core';
import { BigNumber, ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const parse = (value: unknown, description: string, max?: BigNumberish): BigNumber => {
  try {
    if (isBigNumberish(value)) {
      const bn = BigNumber.from(value);

      if (max !== undefined && bn.gt(max))
        throw new UserInputError(`Must be less than or equal to ${max}`);

      return bn;
    }
  } catch (_) {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

const createBnScalar = (name: string, description: string, max?: BigNumberish) =>
  createScalar<BigNumber, string>({
    name,
    description,
    serialize: (value) => (value as BigNumber).toString(),
    parseValue: (value: unknown) => parse(value, description, max),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT)
        return parse(ast.value, description, max);
      throw new UserInputError('Must be a string or integer');
    },
  });

export const [BigNumberScalar, BigNumberField] = createBnScalar('BigNumber', 'integer');

export const [Uint256BnScalar, Uint256BnField] = createBnScalar(
  'Uint256',
  '256-bit unsigned integer',
  ethers.constants.MaxUint256,
);
