import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { UsersModule } from "./features/users/users.module";
import { loggingMiddleware } from "./middleware/prisma/logging.middleware";
import { HealthModule } from "./features/health/health.module";
import { StitchedGqlModule } from "./features/stitched-gql/stitched-gql.module";
import { IS_DEV } from "lib";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    StitchedGqlModule.forRootAsync({
      autoSchemaFile: "schema.gql",
      sortSchema: true,
      debug: IS_DEV,
      introspection: true,
      playground: false,
      plugins: IS_DEV ? [ApolloServerPluginLandingPageLocalDefault()] : [],
    }),

    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
