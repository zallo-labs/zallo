import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Logger, Module, NestMiddleware } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CONFIG, LogLevel } from '~/config';
import { IncomingContext, GqlContext, IncomingWsContext } from '~/request/ctx';
import { AddressMiddleware } from './address.middleware';
import { AuthModule } from '~/features/auth/auth.module';
import { SessionMiddleware } from '~/features/auth/session.middleware';
import { AuthMiddleware } from '~/features/auth/auth.middleware';
import { Request, Response } from 'express';
import { RequestContextMiddleware } from 'nestjs-request-context';
import { GraphQLError } from 'graphql';

export const GQL_ENDPOINT = '/graphql';

const useMiddleware = async (req: Request, ...middleware: NestMiddleware[]) => {
  const chain = (req: Request, resolve: () => void, middlewares: NestMiddleware[]) => {
    if (!middlewares.length) return () => resolve();
    const [middleware, ...rest] = middlewares;

    return () => middleware!.use(req, {} as Response, chain(req, resolve, rest));
  };

  return new Promise<void>((resolve) => chain(req, resolve, middleware)());
};

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [SessionMiddleware, AuthMiddleware, RequestContextMiddleware],
      useFactory: (
        sessionMiddleware: SessionMiddleware,
        authMiddleware: AuthMiddleware,
        requestContextMiddleware: RequestContextMiddleware,
      ) => ({
        autoSchemaFile: 'schema.graphql',
        sortSchema: true,
        debug: CONFIG.logLevel === LogLevel.Debug || CONFIG.logLevel === LogLevel.Verbose,
        introspection: true,
        path: GQL_ENDPOINT,
        cache: 'bounded',
        cors: false, // Configured in main.ts; omitting reconfigures CORS
        bodyParserConfig: {
          limit: '1mb',
        },
        subscriptions: {
          'graphql-ws': {
            onSubscribe: async (ctx) => {
              const req = (ctx as IncomingWsContext).extra.request;

              // Copy connection parameters into headers
              req.headers = {
                // Lowercase all header keys - as done by express for http requests; this is done by request to avoid ambiguity in headers
                ...(Object.fromEntries(
                  Object.entries(ctx.connectionParams ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
                ) as Partial<typeof req.headers>),
                // Load req.headers after connectionParams to avoid potentially malicious overwrites (e.g. host)
                ...req.headers,
              };

              try {
                await useMiddleware(
                  req,
                  sessionMiddleware,
                  authMiddleware,
                  requestContextMiddleware, // RequestContext does *NOT* pass through to subscription resolvers, remove?
                );
              } catch (e) {
                Logger.debug('GraphQL onSubscription error', e);
                return [new GraphQLError((e as Error).message, { originalError: e as Error })];
              }
            },
          },
        },
        context: (ctx: IncomingContext): GqlContext =>
          'req' in ctx ? { req: ctx.req } : { req: ctx.extra.request },
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })],
      }),
    }),
  ],
})
export class ApolloModule {}
