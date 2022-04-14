import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { loggingMiddleware } from './features/prisma/prisma.logging';
import { HealthModule } from './features/health/health.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { SafesModule } from './features/safes/safes.module';
import { AuthModule } from './features/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './features/auth/auth.guard';
import { GqlModule } from './features/apollo/apollo.module';
import { AuthMiddleware } from './features/auth/auth.middleware';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    GqlModule,
    ApproversModule,
    AuthModule,
    HealthModule,
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
