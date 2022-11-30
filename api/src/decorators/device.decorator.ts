import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '~/request/ctx';

export const DeviceAddr = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Context>();
  if (!ctx.user) throw new Error('Device not authenticated');

  return ctx.user.id;
});
