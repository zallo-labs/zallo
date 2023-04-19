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

export interface GqlContext {
  req: Request;
}

export const getRequestContext = (): Request => RequestContext.currentContext?.req;

export const getUserCtx = () => {
  const ctx = getRequestContext()?.user;
  if (!ctx) throw new Error("Can't get user context - user is unauthenticated");
  return ctx;
};

export const getUser = () => getUserCtx().id;

export const asUser = <R, TArgs extends unknown[]>(
  user: UserContext | GqlContext,
  callback: (...args: TArgs) => R,
  ...args: TArgs
): R => {
  if ('req' in user) {
    if (!user.req.user) throw new Error("Can't get user from GqlContext");
    user = user.req.user;
  }

  const requestContext = new RequestContext({ user }, {});
  RequestContext.cls.enterWith(requestContext); // Used to persist context in @ResolveField. TODO: test this doesn't leak across @ResolveField requests. If it does then @Context can be used inside @ResolveField to re-establish context.
  return RequestContext.cls.run(requestContext, callback, ...args);
};
