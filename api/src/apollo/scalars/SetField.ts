import { Field, FieldOptions, GqlTypeReference } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';
import { minLengthMiddleware } from './util';

export const SetField =
  (
    typeFunc: () => GqlTypeReference,
    options?: FieldOptions & { min?: number },
  ): PropertyDecorator =>
  (target, propertyKey) => {
    Field(() => [typeFunc()], {
      ...options,
      middleware: [
        ...(options?.middleware ?? []),
        async (_ctx, next) => {
          const values: unknown[] = await next();

          const set = new Set(values);
          if (set.size !== values.length) throw new UserInputError('Values must be unique');

          return set;
        },
        ...(options?.min ? [minLengthMiddleware(options?.min)] : []),
      ],
    })(target, propertyKey);
  };
