import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { address } from 'lib';
import { Ctx } from '~/request/ctx';

export const DeviceAddr = createParamDecorator((_data, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<Ctx>();
  if (!ctx.req.device) throw new Error('Device not authenticated');

  return address(ctx.req.device);
});
