import { FieldMiddleware } from '@nestjs/graphql';
import { toId } from 'lib';

export const IdMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();
  if (ctx.info.fieldName === 'id' && typeof value === 'string') return toId(value);

  return value;
};
