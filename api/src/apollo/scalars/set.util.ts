import { UserInputError } from 'apollo-server-core';
import { Kind, ValueNode } from 'graphql';

export const createParseSetValue =
  <T>(parseValue: (value: unknown) => T, min?: number) =>
  (values: unknown): Set<T> => {
    if (!Array.isArray(values)) throw new UserInputError('Must be a list');

    if (min !== undefined && values.length < min)
      throw new UserInputError(`Must have at least ${min} item${min > 1 ? 's' : ''}`);

    const set = new Set(values.map(parseValue));
    if (set.size !== values.length) throw new UserInputError('Values must be unique');

    return set;
  };

export const parseSetLiteral =
  <T>(...params: Parameters<typeof createParseSetValue<T>>) =>
  (ast: ValueNode) => {
    if (ast.kind === Kind.LIST) return createParseSetValue(...params)(ast.values);
    throw new UserInputError('Must be a list');
  };
