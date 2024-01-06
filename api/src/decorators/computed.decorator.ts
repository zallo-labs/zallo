import {
  Extensions,
  FieldMiddleware,
  ResolveField,
  ResolveFieldOptions,
  ReturnTypeFunc,
} from '@nestjs/graphql';

import { ObjectTypeSet } from '~/edgeql-js/reflection';
import { Shape } from '~/features/database/database.select';
import { asUser, GqlContext } from '~/request/ctx';

const asUserMiddleware: FieldMiddleware<unknown, GqlContext> = async ({ context }, next) =>
  asUser(context, next);

export const ComputedField =
  <T extends ObjectTypeSet>(
    typeFunc: ReturnTypeFunc,
    select: Shape<T>,
    options?: ResolveFieldOptions,
  ): MethodDecorator =>
  (target, propertyKey, descriptor) => {
    ResolveField(typeFunc, {
      ...options,
      middleware: [asUserMiddleware, ...(options?.middleware ?? [])],
    })(target, propertyKey, descriptor);
    Extensions({ select })(target, propertyKey, descriptor);
  };
