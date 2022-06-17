import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = '32-byte string';

const isBytes32 = (v: unknown): v is BytesLike =>
  ethers.utils.isHexString(v, 32);

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BytesLike => {
  if (!isBytes32(value)) throw error;
  return value;
};

export const GqlBytes32 = new GraphQLScalarType({
  name: 'Bytes32',
  description,
  serialize: (value: BytesLike) => ethers.utils.hexlify(value),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const Bytes32Field =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlBytes32, options)(target, propertyKey);
  };
