import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { UserInputError } from 'apollo-server-core';
import { BigNumber, ethers } from 'ethers';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = '256-bit unsigned integer';

const parse = (value: unknown): BigNumber => {
  try {
    if (isBigNumberish(value)) {
      const bn = BigNumber.from(value);
      if (bn.gte(0) && bn.lte(ethers.constants.MaxUint256)) return bn;
    }
  } catch {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [Uint256BnScalar, Uint256BnField] = createScalar<BigNumber, string>({
  name: 'Uint256',
  description,
  serialize: (value) => (value as BigNumber).toString(),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return parse(ast.value);
    throw new UserInputError('Must be a string or integer');
  },
});
