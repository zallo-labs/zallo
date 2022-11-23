import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} from 'apollo-server-core';
import { IS_DEV } from '~/config';
import { AddressMiddleware } from './address.middleware';
import { IdMiddleware } from './id.middleware';

export const GQL_ENDPOINT = '/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
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
  ],
})
export class ApolloModule {}
