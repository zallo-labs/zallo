import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '~/request/ctx';

export const UserCtx = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Context>();
  if (!ctx.user) throw new Error('User not authenticated');

  return ctx.user;
});

export const UserId = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Context>();
  if (!ctx.user) throw new Error('User not authenticated');

  return ctx.user.id;
});
