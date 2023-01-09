import { UserInputError } from 'apollo-server-core';
import { Kind } from 'graphql';
import { MAX_QUORUM_KEY, QuorumKey, QUORUM_KEY_BITS, toQuorumKey } from 'lib';
import { createScalar } from './util';

const description = `Quorum key: a ${QUORUM_KEY_BITS}-bit unsigned integer`;

const parse = (value: string | number): QuorumKey => {
  try {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (n > MAX_QUORUM_KEY)
      throw new UserInputError(`Must be less than or equal to ${MAX_QUORUM_KEY}`);

    return toQuorumKey(n);
  } catch (_) {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [QuorumKeyScalar, QuorumKeyField] = createScalar<QuorumKey, number>({
  name: 'QuorumKey',
  description,
  serialize: (value) => value as QuorumKey,
  parseValue: (value: unknown) => parse(value as number),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return parse(ast.value);
    throw new UserInputError('Must be a string or integer');
  },
});
