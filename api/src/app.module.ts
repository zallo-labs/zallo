import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from 'nestjs-prisma';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { IS_DEV } from 'config';
import { loggingMiddleware } from './middleware/prisma/logging.middleware';
import { HealthModule } from './features/health/health.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { SafesModule } from './features/safes/safes.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: IS_DEV,
      introspection: true,
      playground: false,
      plugins: IS_DEV ? [ApolloServerPluginLandingPageLocalDefault()] : [],
    }),

    ApproversModule,
    HealthModule,
    SafesModule,
  ],
})
export class AppModule {}
