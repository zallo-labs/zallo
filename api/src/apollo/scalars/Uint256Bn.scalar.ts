import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BigNumber } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = '256-bit unsigned integer';

const max = BigNumber.from(2).pow(256).sub(1); // 2^256 -1

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BigNumber => {
  try {
    if (isBigNumberish(value)) {
      const bn = BigNumber.from(value);
      if (bn.gte(0) && bn.lte(max)) return bn;
    }
  } catch (_) {
    //
  }
  throw error;
};

export const GqlUint256Bn = new GraphQLScalarType({
  name: 'Uint256',
  description,
  serialize: (value: BigNumber) => value.toString(),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const Uint256BnField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlUint256Bn, options)(target, propertyKey);
  };
