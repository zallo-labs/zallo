import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'nestjs-prisma';

import { loggingMiddleware } from './prisma/prisma.logging';
import { HealthModule } from './health/health.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { SafesModule } from './features/safes/safes.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ProviderModule } from './provider/provider.module';
import { GroupsModule } from './features/groups/groups.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { GroupApproverModule } from './features/group-approver/group-approver.module';
import { ContractMethodsModule } from './features/contract-methods/contract-methods.module';
import { TxsModule } from './features/txs/txs.module';
import { SubmissionsModule } from './features/submissions/submissions.module';
import { CommentsModule } from './features/comments/comments.module';
import { ReactionsModule } from './features/reactions/reactions.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    ApolloModule,
    AuthModule,
    ProviderModule,
    HealthModule,
    // Features
    ApproversModule,
    CommentsModule,
    ContactsModule,
    ContractMethodsModule,
    GroupApproverModule,
    GroupsModule,
    ReactionsModule,
    SafesModule,
    SubmissionsModule,
    TxsModule,
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
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
