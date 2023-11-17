import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { Address, tryAsAddress } from 'lib';
import { createScalar } from './util';

const description = 'Ethereum address';

const parseValue = (value: unknown): Address => {
  const address = typeof value === 'string' && tryAsAddress(value);
  if (!address) throw new UserInputError(`Provided value is not a ${description}`);
  return address;
};

export const [AddressScalar, AddressField] = createScalar<Address, Address>({
  name: 'Address',
  description,
  serialize: (value) => value,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
});
