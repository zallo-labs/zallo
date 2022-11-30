import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} from 'apollo-server-core';
import { IS_DEV } from '~/config';
import { IncomingContext, Context, IncomingWsContext } from '~/request/ctx';
import { AddressMiddleware } from './address.middleware';
import { IdMiddleware } from './id.middleware';
import { AuthModule } from '~/auth/auth.module';
import { AuthService } from '~/auth/auth.service';
import { SessionService } from '~/auth/session.service';

export const GQL_ENDPOINT = '/graphql';

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [AuthService, SessionService],
      useFactory: (auth: AuthService, session: SessionService) => ({
        autoSchemaFile: 'schema.graphql',
        sortSchema: true,
        debug: IS_DEV,
        introspection: true,
        path: GQL_ENDPOINT,
        cache: 'bounded',
        cors: false, // Configured in main.ts; omitting reconfigures CORS
        buildSchemaOptions: {
          fieldMiddleware: [IdMiddleware, AddressMiddleware],
        },
        subscriptions: {
          'graphql-ws': {
            onSubscribe: (ctx) => {
              const extra = ctx.extra as IncomingWsContext['extra'];
              const req = extra.request;

              session.handler(req, {} as any, async () => {
                // Copy connection parameters into headers
                req.headers = {
                  ...req.headers,
                  ...(ctx.connectionParams as Partial<typeof req.headers>),
                };

                extra.user = await auth.tryAuth(req);
              });
            },
          },
        },
        context: (ctx: IncomingContext): Context =>
          'req' in ctx
            ? { req: ctx.req, user: ctx.req.user }
            : { req: ctx.extra.request, user: ctx.extra.user },
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
