import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType } from 'graphql';
import { Id, toId } from 'lib';

const description = 'Identifier';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown): Id => {
  if (typeof value !== 'string' || typeof value['toString'] !== 'function') throw error;
  return toId(`${value}`);
};

export const IdScalar = new GraphQLScalarType<Id, string>({
  name: 'Id',
  description,
  serialize: (value) => value as Id,
  parseValue: (value: unknown) => parse(value),
  parseLiteral: (ast) => {
    if ('value' in ast) return parse(ast.value);
    throw error;
  },
});

export const IdField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => IdScalar, options)(target, propertyKey);
  };
