import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Ctx } from '~/request/ctx';

export const UserMsg = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
  return ctx.req.userMessage;
});

export const UserAddr = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
  return ctx.req.userMessage?.address;
});
