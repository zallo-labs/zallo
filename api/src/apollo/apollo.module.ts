import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageGraphQLPlaygroundOptions,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';

import { IS_DEV } from 'config';
import { AddressMiddleware } from './address.middleware';
import { IdMiddleware } from './id.middleware';

export const GQL_ENDPOINT = '/graphql';

const settings: ApolloServerPluginLandingPageGraphQLPlaygroundOptions['settings'] =
  {
    'request.credentials': 'include',
  };

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
      playground: {
        settings,
      },
      // Breaks on firefox
      // playground: false,
      // plugins: IS_DEV
      //   ? [
      //       ApolloServerPluginLandingPageLocalDefault({
      //         includeCookies: true,
      //         variables: settings as Record<string, string>,
      //       }),
      //     ]
      //   : [],
      cors: {
        origin: 'https://studio.apollographql.com',
        credentials: true,
      },
    }),
  ],
})
export class ApolloModule {}
