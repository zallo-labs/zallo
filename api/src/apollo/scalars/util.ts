import { Field, FieldOptions } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

// TODO: util for creating scalar and field
export const createScalar = <TInternal, TExternal = TInternal>(
  ...params: ConstructorParameters<typeof GraphQLScalarType<TInternal, TExternal>>
) => {
  const scalar = new GraphQLScalarType(...params);

  const field =
    (options?: FieldOptions): PropertyDecorator =>
    (target, propertyKey) => {
      Field(() => scalar, options)(target, propertyKey);
    };

  return [scalar, field] as const;
};
