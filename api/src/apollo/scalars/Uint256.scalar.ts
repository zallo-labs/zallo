import { Field, FieldOptions } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType, Kind } from 'graphql';

const description = '256-bit unsigned integer';

const max = new Decimal(2).pow(256).sub(1); // 2^256 -1

const isDecimalValue = (v: unknown): v is Decimal.Value =>
  typeof v === 'number' || typeof v === 'string';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): Decimal => {
  try {
    if (isDecimalValue(value)) {
      const decimal = new Decimal(value);
      if (decimal.gte(0) && decimal.lte(max)) return decimal;
    }
  } catch (_) {
    //
  }
  throw error;
};

export const GqlUint256Decimal = new GraphQLScalarType({
  name: 'Uint256',
  description,
  serialize: (value: Decimal) => value.toString(),
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return parse(ast.value);
    throw error;
  },
});

export const Uint256DecimalField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlUint256Decimal, options)(target, propertyKey);
  };
