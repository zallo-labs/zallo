import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticationError } from '@nestjs/apollo';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { isPublic } from '~/common/decorators/public.decorator';
import { getContextUnsafe } from '~/core/context';
import { match } from 'ts-pattern';
import { GqlContext } from '~/core/apollo/ctx';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (isPublic(this.reflector, context)) return true;

    match(context.getType<GqlContextType>())
      .with('graphql', () => {
        // getContext() can't be used for graphql subscriptions
        const { user } = GqlExecutionContext.create(context).getContext<GqlContext>();
        if (!user) throw new AuthenticationError('Route requires authentication');
      })
      .otherwise(() => {
        if (getContextUnsafe()?.user === undefined)
          throw new UnauthorizedException('Route requires authentication');
      });

    return true;
  }
}
