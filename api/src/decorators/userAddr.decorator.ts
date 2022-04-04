import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import CONFIG from 'lib/config';

export const UserAddr = createParamDecorator((data, context: ExecutionContext) => {
  //   const ctx = GqlExecutionContext.create(context);
  //   return ctx.getContext().req.user;
  return CONFIG.wallet.address!;
});
