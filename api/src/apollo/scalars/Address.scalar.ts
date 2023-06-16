import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { asAddress, Address, isAddressLike } from 'lib';
import { createScalar } from './util';

const description = 'Ethereum address';

const parseValue = (value: unknown): Address => {
  if (!isAddressLike(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return asAddress(value);
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
