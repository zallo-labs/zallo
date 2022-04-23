import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { loggingMiddleware } from './features/prisma/prisma.logging';
import { HealthModule } from './features/health/health.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { SafesModule } from './features/safes/safes.module';
import { AuthModule } from './features/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './features/auth/auth.guard';
import { ApolloModule } from './features/apollo/apollo.module';
import { AuthMiddleware } from './features/auth/auth.middleware';
import { ProviderModule } from './features/provider/provider.module';
import { GroupsModule } from './features/groups/groups.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    ApolloModule,
    ApproversModule,
    AuthModule,
    GroupsModule,
    HealthModule,
    ProviderModule,
    SafesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
