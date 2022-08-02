import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'nestjs-prisma';

import { loggingMiddleware } from './prisma/prisma.logging';
import { HealthModule } from './health/health.module';
import { UsersModule } from './features/users/users.module';
import { SafesModule } from './features/safes/safes.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './provider/provider.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { ContractMethodsModule } from './features/contract-methods/contract-methods.module';
import { TxsModule } from './features/txs/txs.module';
import { SubmissionsModule } from './features/submissions/submissions.module';
import { CommentsModule } from './features/comments/comments.module';
import { ReactionsModule } from './features/reactions/reactions.module';
import { SubgraphModule } from './features/subgraph/subgraph.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import CONFIG from 'config';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    RedisModule.forRoot({ config: { url: CONFIG.redisUrl } }),
    AuthModule,
    ApolloModule,
    ProviderModule,
    HealthModule,
    // Features
    ApproversModule,
    CommentsModule,
    ContactsModule,
    ContractMethodsModule,
    FaucetModule,
    AccountsModule,
    ReactionsModule,
    SafesModule,
    SubgraphModule,
    SubmissionsModule,
    TxsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
