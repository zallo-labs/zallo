import { Decimal } from '@prisma/client/runtime';
import { UserInputError } from 'apollo-server-core';
import { Kind } from 'graphql';
import { createScalar } from './util';

const description = '256-bit unsigned integer';

const max = new Decimal(2).pow(256).sub(1); // 2^256 -1

const isDecimalValue = (v: unknown): v is Decimal.Value =>
  typeof v === 'number' || typeof v === 'string';

const parse = (value: unknown): Decimal => {
  try {
    if (isDecimalValue(value)) {
      const decimal = new Decimal(value);
      if (decimal.gte(0) && decimal.lte(max)) return decimal;
    }
  } catch {
    //
  }
  throw new UserInputError(`Provided value is not a ${description}`);
};

export const [Uint256DecimalScalar, Uint256DecimalField] = createScalar<Decimal, Decimal.Value>({
  name: 'Uint256',
  description,
  serialize: (value) => (value as Decimal).toString(),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT)
      return parse(ast.value);
    throw new UserInputError('Must be a string, integer, or float');
  },
});
