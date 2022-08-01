import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { BytesLike, ethers } from 'ethers';
import { GraphQLScalarType, Kind } from 'graphql';

const description = '4-byte string';

const isBytes4 = (v: unknown): v is BytesLike => ethers.utils.isHexString(v, 4);

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): BytesLike => {
  if (!isBytes4(value)) throw error;
  return value;
};

export const GqlBytes4 = new GraphQLScalarType({
  name: 'Bytes4',
  description,
  serialize: (value: BytesLike) => ethers.utils.hexlify(value),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const Bytes4Field =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlBytes4, options)(target, propertyKey);
  };
