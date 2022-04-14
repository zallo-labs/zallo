import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const key = 'isPublic';

export const Public = () => SetMetadata(key, true);

export const isPublic = (reflector: Reflector, context: ExecutionContext) =>
  reflector.getAllAndOverride<boolean>(key, [context.getClass(), context.getHandler()]);
