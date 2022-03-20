import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { GraphQLModule } from "@nestjs/graphql";
import { IS_DEV } from "lib";
import { UsersModule } from "./features/users/users.module";
import { loggingMiddleware } from "./middleware/prisma/logging.middleware";
import { HealthModule } from "./features/health/health.module";

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
      autoSchemaFile: "schema.gql", // : true;    // to generate in memory
      sortSchema: true,
      // installSubscriptionHandlers: true,
      // subscriptions: {
      //   "graphql-ws": true
      // },
      playground: false,
      plugins: IS_DEV ? [ApolloServerPluginLandingPageLocalDefault()] : undefined,
      introspection: true,
      debug: IS_DEV,
    }),

    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
