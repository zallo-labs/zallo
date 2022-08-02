import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageGraphQLPlaygroundOptions,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} from 'apollo-server-core';
import { IS_DEV } from 'config';
import { AddressMiddleware } from './address.middleware';
import { IdMiddleware } from './id.middleware';

export const GQL_ENDPOINT = '/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: IS_DEV,
      introspection: true,
      path: GQL_ENDPOINT,
      buildSchemaOptions: {
        fieldMiddleware: [IdMiddleware, AddressMiddleware],
      },
      // plugins: [new LoggingPlugin()],
      cors: {
        origin: 'https://studio.apollographql.com',
        credentials: true,
      },
      playground: false,
      plugins: IS_DEV
        ? [
            ApolloServerPluginLandingPageLocalDefault({
              includeCookies: true,
              variables: {
                'request.credentials': 'include',
              } as ApolloServerPluginLandingPageGraphQLPlaygroundOptions['settings'],
            }),
            ApolloServerPluginInlineTrace(),
          ]
        : [],
    }),
  ],
})
export class ApolloModule {}
