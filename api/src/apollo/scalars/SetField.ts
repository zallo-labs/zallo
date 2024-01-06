import { UserInputError } from '@nestjs/apollo';
import { Field, FieldMiddleware, FieldOptions, GqlTypeReference } from '@nestjs/graphql';

import { minLengthMiddleware } from './util';

export const setMiddleware: FieldMiddleware = async (_ctx, next) => {
  const values: unknown[] = await next();

  const set = new Set(values);
  if (set.size !== values.length) throw new UserInputError('Values must be unique');

  return set;
};

export const SetField =
  (
    typeFunc: () => GqlTypeReference,
    options?: FieldOptions & { minLength?: number },
  ): PropertyDecorator =>
  (target, propertyKey) =>
    Field(() => [typeFunc()], {
      ...options,
      middleware: [
        ...(options?.middleware ?? []),
        ...(options?.minLength ? [minLengthMiddleware(options?.minLength)] : []),
        setMiddleware,
      ],
    })(target, propertyKey);
