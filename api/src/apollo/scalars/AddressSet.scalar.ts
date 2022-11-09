import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType, Kind } from 'graphql';
import { address, Address, isAddressLike } from 'lib';

const description = 'Ethereum address set';

const error = new UserInputError(`Value is not a ${description}`);

const parse = (values: unknown, min?: number): Set<Address> => {
  if (!Array.isArray(values) || !values.every(isAddressLike)) throw error;

  if (min !== undefined && values.length < min)
    throw new UserInputError(`Must have at least ${min} item(s)`);

  const set = new Set(values.map(address));
  if (set.size !== values.length) throw new UserInputError('Values must be unique');

  return set;
};

const create = (name: string, min?: number) =>
  new GraphQLScalarType<Set<Address>, Address[]>({
    name,
    description,
    serialize: (values) => [...(values as Set<Address>)],
    parseValue: (values) => parse(values, min),
    parseLiteral: (ast) => {
      if (ast.kind === Kind.LIST) return parse(ast.values, min);
      throw error;
    },
  });

export const AddressSetScalar = create('AddressSet');
export const AddressSetField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => AddressSetScalar, options)(target, propertyKey);
  };

export const NonEmptyAddressSetScalar = create('NonEmptyAddressSet', 1);
export const NonEmptyAddressSetField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => NonEmptyAddressSetScalar, options)(target, propertyKey);
  };
