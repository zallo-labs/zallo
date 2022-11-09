import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BigNumber } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = 'whole number';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BigNumber => {
  try {
    if (isBigNumberish(value)) return BigNumber.from(value);
  } catch (_) {
    //
  }
  throw error;
};

export const GqlBigNumber = new GraphQLScalarType<BigNumber, string>({
  name: 'BigNumber',
  description,
  serialize: (value) => (value as BigNumber).toString(),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return parse(ast.value);
    throw error;
  },
});

export const BigNumberField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlBigNumber, options)(target, propertyKey);
  };
