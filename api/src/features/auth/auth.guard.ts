import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticationError } from '@nestjs/apollo';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from '~/request/ctx';
import { isPublic } from '~/decorators/public.decorator';
import { Request } from 'express';
import { match } from 'ts-pattern';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    match(context.getType<GqlContextType>())
      .with('graphql', () => {
        const { user } = GqlExecutionContext.create(context).getContext<GqlContext>().req;
        if (!user && !isPublic(this.reflector, context))
          throw new AuthenticationError('Route requires authentication');
      })
      .with('http', () => {
        const { user } = context.switchToHttp().getRequest<Request>();
        if (!user && !isPublic(this.reflector, context))
          throw new UnauthorizedException('Route requires authentication');
      })
      .otherwise(() => {
        throw new Error('AuthGuard only supports http and graphql contexts');
      });

    return true;
  }
}
