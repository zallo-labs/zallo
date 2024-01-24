import { Field, FieldMiddleware, FieldOptions, GqlTypeReference } from '@nestjs/graphql';
import { UserInputError } from '@nestjs/apollo';
import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { merge } from 'ts-deepmerge';
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

export function createScalar<TInternal, TExternal extends Jsonable>(
  config: Config<TInternal, TExternal>,
  defaultOptions?: FieldOptions<TInternal>,
) {
  const scalar = new GraphQLScalarType({
    ...(config.parseValue && {
      parseLiteral: (ast, variables) => config.parseValue!(parseLiteral(ast, variables)),
    }),
    ...config,
  } as GraphQLScalarTypeConfig<TInternal, TExternal>);

  const field = createField(scalar, defaultOptions);

  return [scalar, field] as const;
}

export function createField<T>(scalar: GqlTypeReference<T>, defaultOptions?: FieldOptions<T>) {
  return (options?: FieldOptions<T>): PropertyDecorator =>
    (target, propertyKey) => {
      Field(() => scalar, merge(defaultOptions ?? {}, options ?? {}) as FieldOptions<T>)(
        target,
        propertyKey,
      );
    };
}

export const minLengthMiddleware =
  (min: number): FieldMiddleware =>
  async (_ctx, next) => {
    const value: unknown[] = await next();

    if (min && value.length < min)
      throw new UserInputError(`Must have at least ${min} item${min > 1 ? 's' : ''}`);

    return value;
  };
