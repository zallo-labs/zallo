import { Field, FieldMiddleware, FieldOptions } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import merge from 'ts-deepmerge';
import { O } from 'ts-toolbelt';
import { parseLiteral } from './parseLiteral';

type Jsonable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Jsonable[]
  | { [key: string]: Jsonable }
  | { toJSON(): Jsonable };

type Config<TInternal, TExternal extends Jsonable> = Omit<
  O.Optional<GraphQLScalarTypeConfig<TInternal, TExternal>, 'parseLiteral'>,
  'serialize'
> & {
  serialize: (value: TInternal) => TExternal;
};

// TODO: util for creating scalar and field
export const createScalar = <TInternal, TExternal extends Jsonable>(
  config: Config<TInternal, TExternal>,
  defaultOptions?: FieldOptions,
) => {
  const scalar = new GraphQLScalarType({
    ...(config.parseValue && {
      parseLiteral: (ast, variables) => config.parseValue!(parseLiteral(ast, variables)),
    }),
    ...config,
  } as GraphQLScalarTypeConfig<TInternal, TExternal>);

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

    return value;
  };
