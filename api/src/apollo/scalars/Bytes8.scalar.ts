import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = '8-byte string';

const isBytes8 = (v: unknown): v is BytesLike => ethers.utils.isHexString(v, 8);

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BytesLike => {
  if (!isBytes8(value)) throw error;
  return value;
};

export const GqlBytes8 = new GraphQLScalarType<BytesLike, string>({
  name: 'Bytes8',
  description,
  serialize: (value) => ethers.utils.hexlify(value as BytesLike),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const Bytes8Field =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlBytes8, options)(target, propertyKey);
  };
