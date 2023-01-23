import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'nestjs-prisma';
import { loggingMiddleware } from './prisma/prisma.logging';
import { HealthModule } from './health/health.module';
import { UsersModule } from './features/users/users.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './provider/provider.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { ContractMethodsModule } from './features/contract-methods/contract-methods.module';
import { ProposalsModule } from './features/proposals/proposals.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { CommentsModule } from './features/comments/comments.module';
import { ReactionsModule } from './features/reactions/reactions.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CONFIG } from './config';
import { SubgraphModule } from './features/subgraph/subgraph.module';
import { ExpoModule } from './expo/expo.module';
import { PubsubModule } from './pubsub/pubsub.module';
import { QuorumsModule } from './features/quorums/quorums.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    RedisModule.forRoot({
      // Publisher client
      config: { url: CONFIG.redisUrl },
    }),
    BullModule.forRoot({
      url: CONFIG.redisUrl, // Requires a subscriber client, so the default RedisService can't be used
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    AuthModule,
    ApolloModule,
    PubsubModule,
    ProviderModule,
    HealthModule,
    // Features
    AccountsModule,
    ApproversModule,
    CommentsModule,
    ContactsModule,
    ContractMethodsModule,
    FaucetModule,
    ProposalsModule,
    QuorumsModule,
    ReactionsModule,
    SubgraphModule,
    TransactionsModule,
    UsersModule,
    ExpoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
