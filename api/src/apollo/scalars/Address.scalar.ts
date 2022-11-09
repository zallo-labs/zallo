import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType, Kind } from 'graphql';
import { address, Address, isAddressLike } from 'lib';

const description = 'Ethereum address';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): Address => {
  if (!isAddressLike(value)) throw error;
  return address(value);
};

export const AddressScalar = new GraphQLScalarType<Address, string>({
  name: 'Address',
  description,
  serialize: (value) => value as Address,
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const AddressField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => AddressScalar, options)(target, propertyKey);
  };

export const AddressesField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => [AddressScalar], options)(target, propertyKey);
  };
