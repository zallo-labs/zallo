import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { UserInputError } from 'apollo-server-core';
import { BigNumber } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = 'whole number';

const parse = (value: unknown): BigNumber => {
  try {
    if (isBigNumberish(value)) return BigNumber.from(value);
  } catch (_) {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [BigNumberScalar, BigNumberField] = createScalar<BigNumber, string>({
  name: 'BigNumber',
  description,
  serialize: (value) => (value as BigNumber).toString(),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return parse(ast.value);
    throw new UserInputError('Must be a string or integer');
  },
});
