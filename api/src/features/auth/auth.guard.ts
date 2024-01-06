import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isPublic } from '~/decorators/public.decorator';
import { GqlContext } from '~/request/ctx';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext<GqlContext>();

    if (!ctx.req.user && !isPublic(this.reflector, context))
      throw new UnauthorizedException('Route requires authentication');

    return true;
  }
}
