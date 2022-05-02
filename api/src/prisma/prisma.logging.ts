import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const loggingMiddleware = (): Prisma.Middleware => async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  Logger.verbose(`Prisma Query ${params.model}.${params.action} took ${after - before}ms`);

  return result;
};
