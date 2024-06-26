import { AsyncLocalStorage } from 'async_hooks';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { Address, UAddress, UUID } from 'lib';
import { GqlContext } from '~/core/apollo/ctx';
import { type Client as DatabaseClient } from 'edgedb';

export interface Context {
  afterRequestHooks: AfterRequestHook[];
  user?: UserContext;
  db?: DatabaseClient;
}

export interface UserContext {
  id: UUID;
  approver: Address;
  accounts: UserAccountContext[];
}

export interface UserAccountContext {
  id: uuid;
  address: UAddress;
}

type AfterRequestHook = () => unknown | Promise<unknown>;

export const REQUEST_CONTEXT = new AsyncLocalStorage<Context>();

export function getDefaultContext(): Context {
  return { afterRequestHooks: [] };
}

export function getContextUnsafe() {
  return REQUEST_CONTEXT.getStore();
}

export function getContext() {
  const ctx = getContextUnsafe();
  if (!ctx) throw new Error("Can't get request context - ContextMiddleware has not run yet");
  return ctx;
}

export function getUserCtx() {
  const user = getContext().user;
  if (!user)
    throw new Error("Can't get user request context - user is unauthenticated or ContextInter");
  return user;
}

export function getApprover() {
  return getUserCtx().approver;
}

export function afterRequest(hook: AfterRequestHook) {
  const ctx = getContextUnsafe();
  if (ctx) {
    ctx.afterRequestHooks.push(hook);
  } else {
    hook();
  }
}

export function asUser<R, TArgs extends unknown[]>(
  ctxArg: UserContext | GqlContext,
  callback: (...args: TArgs) => R,
  ...args: TArgs
): R {
  const ctx = 'afterRequestHooks' in ctxArg ? ctxArg : { user: ctxArg, afterRequestHooks: [] };

  return REQUEST_CONTEXT.run(ctx, callback, ...args);
}
