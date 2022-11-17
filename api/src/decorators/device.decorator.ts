import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { address } from 'lib';
import { Ctx } from '~/request/ctx';

export const DeviceMsg = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
  return ctx.req.deviceMessage;
});

export const DeviceAddr = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
  if (!ctx.req.deviceMessage) throw new Error('Device message not provided');

  return address(ctx.req.deviceMessage.address);
});
