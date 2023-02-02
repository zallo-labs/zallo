import { createParamDecorator } from '@nestjs/common';
import { getUser } from '~/request/ctx';

export const UserCtx = createParamDecorator(() => getUser());

export const UserId = createParamDecorator(() => getUser().id);
