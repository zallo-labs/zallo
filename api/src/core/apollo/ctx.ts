import { Context } from '~/core/context/context.util';
import { Request, Response } from 'express';
import { Context as BaseWsContext, ConnectionInitMessage } from 'graphql-ws';

export interface IncomingHttpContext {
  req: Request;
  res: Response;
}

export type IncomingWsContext = BaseWsContext<
  ConnectionInitMessage['payload'],
  {
    request: Request;
    context: Context;
  }
>;

export interface GqlContext extends Context {
  req: Request;
}
