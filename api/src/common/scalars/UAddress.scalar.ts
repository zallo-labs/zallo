import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { asUAddress, UAddress, tryAsUAddress } from 'lib';
import { createScalar } from './util';

const description = 'EIP-3770 address';

const parseValue = (value: unknown): UAddress => {
  const address = typeof value === 'string' && tryAsUAddress(value);
  if (!address) throw new UserInputError(`Value "${value}" is not a ${description}`);
  return asUAddress(value);
};

export const [UAddressScalar, UAddressField] = createScalar<UAddress, UAddress>({
  name: 'UAddress',
  description,
  serialize: (v) => v,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
  specifiedByURL: 'https://eips.ethereum.org/EIPS/eip-3770',
});
