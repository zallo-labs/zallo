import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Logger, Module, NestMiddleware } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CONFIG, LogLevel } from '~/config';
import { GqlContext, IncomingWsContext, IncomingHttpContext } from '~/core/apollo/ctx';
import { AuthModule } from '~/feat/auth/auth.module';
import { SessionMiddleware } from '~/feat/auth/session.middleware';
import { AuthMiddleware } from '~/feat/auth/auth.middleware';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import _ from 'lodash';
import { REQUEST_CONTEXT, getContext, getContextUnsafe, getDefaultContext } from '~/core/context';

export const GQL_ENDPOINT = '/graphql';

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [SessionMiddleware, AuthMiddleware],
      useFactory: (sessionMiddleware: SessionMiddleware, authMiddleware: AuthMiddleware) => {
        const log = new Logger('Apollo');

        return {
          autoSchemaFile: 'schema.graphql',
          sortSchema: true,
          debug: CONFIG.logLevel === LogLevel.Debug || CONFIG.logLevel === LogLevel.Verbose,
          introspection: true,
          path: GQL_ENDPOINT,
          cache: 'bounded',
          subscriptions: {
            'graphql-ws': {
              onSubscribe: async (ctx) => {
                const req = (ctx as IncomingWsContext).extra.request;

                // Lowercase all header keys - as done by express for http requests; this is done by request to avoid ambiguity in headers
                const connectionParams = Object.fromEntries(
                  Object.entries(ctx.connectionParams ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
                ) as Partial<typeof req.headers>;

                // Copy connection parameters into headers
                req.headers = {
                  ...connectionParams,
                  ...req.headers, // Load req.headers after connectionParams to avoid potentially malicious overwrites (e.g. host)
                  ..._.pick(connectionParams, 'authorization'), // Prefer connection params authorization
                };

                try {
                  await REQUEST_CONTEXT.run(getDefaultContext(), async () => {
                    await useMiddleware(req, sessionMiddleware, authMiddleware);
                    const reqCtx = getContextUnsafe();
                    if (reqCtx) (ctx as IncomingWsContext).extra.context = reqCtx;
                  });
                } catch (e) {
                  log.debug('onSubscription error', e);
                  return [new GraphQLError((e as Error).message, { originalError: e as Error })];
                }
              },
            },
          },
          context: (ctx: IncomingHttpContext | IncomingWsContext): GqlContext => {
            return 'req' in ctx
              ? { ...getContext(), req: ctx.req } // HTTP
              : { ...ctx.extra.context, req: ctx.extra.request }; // WS
          },
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })],
        };
      },
    }),
  ],
})
export class ApolloModule {}

async function useMiddleware(req: Request, ...middleware: NestMiddleware[]) {
  const chain = (req: Request, resolve: () => void, middlewares: NestMiddleware[]) => {
    if (!middlewares.length) return () => resolve();
    const [middleware, ...rest] = middlewares;

    return () => middleware!.use(req, {} as Response, chain(req, resolve, rest));
  };

  return new Promise<void>((resolve) => chain(req, resolve, middleware)());
}
