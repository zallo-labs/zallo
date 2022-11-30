import { Field, FieldOptions, GqlTypeReference } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-core';

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

          const min = options?.min;
          if (min && values.length < min)
            throw new UserInputError(`Must have at least ${min} item${min > 1 ? 's' : ''}`);

          const set = new Set(values);
          if (set.size !== values.length) throw new UserInputError('Values must be unique');

          return set;
        },
      ],
    })(target, propertyKey);
  };
