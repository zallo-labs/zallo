import { Field, FieldMiddleware, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType } from 'graphql';
import merge from 'ts-deepmerge';

// TODO: util for creating scalar and field
export const createScalar = <TInternal, TExternal = TInternal>(
  config: ConstructorParameters<typeof GraphQLScalarType<TInternal, TExternal>>[0],
  defaultOptions?: FieldOptions,
) => {
  const scalar = new GraphQLScalarType(config);

  const field =
    (options?: FieldOptions): PropertyDecorator =>
    (target, propertyKey) => {
      Field(() => scalar, merge(defaultOptions ?? {}, options ?? {}))(target, propertyKey);
    };

  return [scalar, field] as const;
};

export const minLengthMiddleware =
  (min: number): FieldMiddleware =>
  async (_ctx, next) => {
    const value: unknown[] = await next();

    if (min && value.length < min)
      throw new UserInputError(`Must have at least ${min} item${min > 1 ? 's' : ''}`);
  };
