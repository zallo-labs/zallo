import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';

import { asPolicyKey, MAX_POLICY_KEY, MIN_POLICY_KEY, PolicyKey } from 'lib';
import { createScalar } from './util';

const description = `Policy key: an unsigned integer [${MIN_POLICY_KEY}, ${MAX_POLICY_KEY}]`;

const parse = (value: string | number): PolicyKey => {
  try {
    const n = Number(value);

    if (n < MIN_POLICY_KEY)
      throw new UserInputError(`Must be greater than or equal to ${MIN_POLICY_KEY}`);
    if (n > MAX_POLICY_KEY)
      throw new UserInputError(`Must be less than or equal to ${MAX_POLICY_KEY}`);

    return asPolicyKey(n);
  } catch (_) {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [PolicyKeyScalar, PolicyKeyField] = createScalar<PolicyKey, number>({
  name: 'PolicyKey',
  description,
  serialize: (value) => value as PolicyKey,
  parseValue: (value: unknown) => parse(value as number),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return parse(ast.value);
    throw new UserInputError('Must be a string or integer');
  },
});
