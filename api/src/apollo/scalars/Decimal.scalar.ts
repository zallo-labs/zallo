import { UserInputError } from '@nestjs/apollo';
import { Kind } from 'graphql';
import { createScalar } from './util';
import Decimal from 'decimal.js';

const description = 'Decimal';

const parseValue = (value: unknown): Decimal => {
  try {
    if (typeof value === 'string' || typeof value === 'number') return new Decimal(value);
  } catch {
    // Throws below
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [DecimalScalar, DecimalField] = createScalar<Decimal, string>({
  name: 'Decimal',
  description,
  serialize: (value) => value.toString(),
  parseValue,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT)
      return parseValue(ast.value);
    throw new UserInputError('Must be a string | int | float');
  },
});
