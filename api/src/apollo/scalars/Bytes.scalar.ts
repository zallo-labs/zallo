import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = 'hex string string';

const isBytes = (v: unknown): v is BytesLike => ethers.utils.isHexString(v);

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BytesLike => {
  if (!isBytes(value)) throw error;
  return value;
};

export const GqlBytes = new GraphQLScalarType<BytesLike, string>({
  name: 'Bytes',
  description,
  serialize: (value) => ethers.utils.hexlify(value as BytesLike),
  parseValue: (value) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const BytesField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlBytes, options)(target, propertyKey);
  };
