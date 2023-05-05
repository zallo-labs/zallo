import { Extensions, ResolveField, ResolveFieldOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { ObjectTypeSet } from '@db/edgeql-js/reflection';
import { Shape } from '~/features/database/database.select';

export const ComputedField =
  <T extends ObjectTypeSet>(
    typeFunc: ReturnTypeFunc,
    select: Shape<T>,
    options?: ResolveFieldOptions,
  ): MethodDecorator =>
  (target, propertyKey, descriptor) => {
    ResolveField(typeFunc, options)(target, propertyKey, descriptor);
    Extensions({ select })(target, propertyKey, descriptor);
  };
