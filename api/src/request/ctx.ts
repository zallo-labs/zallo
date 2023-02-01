import { Request, Response } from 'express';
import { Context as BaseWsContext } from 'graphql-ws';
import { Address } from 'lib';
import { RequestContext } from 'nestjs-request-context';

export interface IncomingHttpContext {
  req: Request;
  res: Response;
}

export type IncomingWsContext = Omit<BaseWsContext, 'extra'> & {
  extra: {
    request: Request;
    user?: UserContext;
  };
};

export type IncomingContext = IncomingHttpContext | IncomingWsContext;

export interface UserContext {
  id: Address;
  accounts: Set<Address>;
}

export interface Context {
  req: Request;
}

export const getRequestContext = (): Request => RequestContext.currentContext?.req;

export const getUserContext = () => {
  const user = getRequestContext()?.user;
  if (!user) throw new Error('User context is undefined');
  return user;
};

export const asUser = <R, TArgs extends unknown[]>(
  user: UserContext,
  callback: (...args: TArgs) => R,
  ...args: TArgs
): R => RequestContext.cls.run(new RequestContext({ user }, {}), callback, ...args);
