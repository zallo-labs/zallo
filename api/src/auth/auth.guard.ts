import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Ctx } from '~/request/ctx';
import { isPublic } from '~/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext<Ctx>();

    if (!ctx.req.deviceMessage && !isPublic(this.reflector, context))
      throw new UnauthorizedException();

    return true;
  }
}
