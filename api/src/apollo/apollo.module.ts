import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module, NestMiddleware } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} from 'apollo-server-core';
import { IS_DEV } from '~/config';
import { IncomingContext, Context, IncomingWsContext } from '~/request/ctx';
import { AddressMiddleware } from './address.middleware';
import { AuthModule } from '~/features/auth/auth.module';
import { SessionMiddleware } from '~/features/auth/session.middleware';
import { AuthMiddleware } from '~/features/auth/auth.middleware';
import { Request, Response } from 'express';
import { RequestContextMiddleware } from 'nestjs-request-context';

export const GQL_ENDPOINT = '/graphql';

const chain = (req: Request, resolve: () => void, middlewares: NestMiddleware[]) => {
  if (!middlewares.length) return () => resolve();
  const [middleware, ...rest] = middlewares;

  return () => middleware!.use(req, {} as Response, chain(req, resolve, rest));
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
        debug: IS_DEV,
        introspection: true,
        path: GQL_ENDPOINT,
        cache: 'bounded',
        cors: false, // Configured in main.ts; omitting reconfigures CORS
        buildSchemaOptions: {
          fieldMiddleware: [AddressMiddleware],
        },
        bodyParserConfig: {
          limit: '1mb',
        },
        subscriptions: {
          'graphql-ws': {
            onSubscribe: async (ctx) => {
              const req = (ctx as IncomingWsContext).extra.request;

              // Copy connection parameters into headers
              req.headers = {
                ...req.headers,
                // Lowercase all header keys - as done by express for http requests; this is done by request to avoid ambiguity in headers
                ...(Object.fromEntries(
                  Object.entries(ctx.connectionParams ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
                ) as Partial<typeof req.headers>),
              };

              await new Promise<void>((resolve) =>
                chain(req, resolve, [
                  sessionMiddleware,
                  authMiddleware,
                  requestContextMiddleware, // Note. RequestContext does *NOT* pass through to subscription resolvers
                ])(),
              );
            },
          },
        },
        context: (ctx: IncomingContext): Context =>
          'req' in ctx ? { req: ctx.req } : { req: ctx.extra.request },
        playground: false,
        plugins: [
          ...(IS_DEV
            ? [
                ApolloServerPluginLandingPageLocalDefault({
                  includeCookies: true,
                }),
                ApolloServerPluginInlineTrace(),
              ]
            : []),
        ],
      }),
    }),
  ],
})
export class ApolloModule {}
