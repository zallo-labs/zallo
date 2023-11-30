import { CHAINS, Chain, isChain } from 'chains';
import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = Object.values(CHAINS)
  .map((c) => c.key)
  .join(' | ');

const parseValue = (value: unknown): Chain => {
  if (!isChain(value)) throw new UserInputError(`Provided value is not a ${description}`);
  return value;
};

// This would be an enum, but '-' is not a valid character in gql enums
export const [ChainScalar, ChainField] = createScalar<Chain, Chain>({
  name: 'Chain',
  description,
  serialize: (value) => value,
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parseValue(ast.value);
    throw new UserInputError('Must be a string');
  },
  extensions: {
    codegenScalarType: 'chains#Chain',
  },
});

// const ChainEnum = {
//   zksync: 'zksync',
//   zksync_goerli: 'zksync-goerli',
//   zksync_local: 'zksync-local',
// } satisfies Record<string, Chain>;
// registerEnumType(ChainEnum, { name: 'Chain' });

// export const ChainField = createField(ChainEnum);
