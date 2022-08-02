import { Field, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType, Kind, StringValueNode } from 'graphql';
import { isAddressLike, Quorum, toQuorum } from 'lib';

const description = 'Quorum';

const error = new UserInputError(`Provided value is not a ${description}`);

const parse = (value: unknown[]): Quorum => {
  if (!Array.isArray(value) || !value.every((v) => isAddressLike(v)))
    throw error;
  return toQuorum(value);
};

export const GqlQuorum = new GraphQLScalarType({
  name: 'QuorumScalar',
  description,
  serialize: (value: Quorum) => value,
  parseValue: (value: unknown[]) => parse(value),
  parseLiteral: (ast) => {
    if (
      ast.kind === Kind.LIST &&
      ast.values.every((v) => v.kind === 'StringValue')
    ) {
      return parse((ast.values as StringValueNode[]).map((v) => v.value));
    }
    throw error;
  },
});

export const QuorumField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => GqlQuorum, options)(target, propertyKey);
  };

export const QuorumsField =
  (options?: FieldOptions): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => [GqlQuorum], options)(target, propertyKey);
  };
