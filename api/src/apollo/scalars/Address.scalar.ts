import { UserInputError } from 'apollo-server-core';
import { Kind } from 'graphql';
import { address, Address, isAddressLike } from 'lib';
import { createParseSetValue, parseSetLiteral } from './set.util';
import { createScalar } from './util';

const description = 'Ethereum address';

const parseValue = (value: unknown): Address => {
  if (!isAddressLike(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return address(value);
};

export const [AddressScalar, AddressField] = createScalar<Address, string>({
  name: 'Address',
  description,
  serialize: (value) => value as Address,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
});

export const [AddressSetScalar, AddressSetField] = createScalar<Set<Address>, Address[]>({
  name: 'AddressSet',
  description: `Set of ${description}s`,
  serialize: (values) => [...(values as Set<Address>)],
  parseValue: createParseSetValue(parseValue, 0),
  parseLiteral: parseSetLiteral(parseValue, 0),
});

export const [NonEmptyAddressSetScalar, NonEmptyAddressSetField] = createScalar<
  Set<Address>,
  Address[]
>({
  name: 'NonEmptyAddressSet',
  description: `Non-empty set of ${description}s`,
  serialize: (values) => [...(values as Set<Address>)],
  parseValue: createParseSetValue(parseValue, 1),
  parseLiteral: parseSetLiteral(parseValue, 1),
});
