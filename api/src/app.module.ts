import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { AuthModule } from './features/auth/auth.module';
import { AuthGuard } from './features/auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './features/util/provider/provider.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { ContractFunctionsModule } from './features/contract-methods/contract-functions.module';
import { ProposalsModule } from './features/proposals/proposals.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { CommentsModule } from './features/comments/comments.module';
import { ReactionsModule } from './features/reactions/reactions.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { SubgraphModule } from './features/subgraph/subgraph.module';
import { ExpoModule } from './features/util/expo/expo.module';
import { PubsubModule } from './features/util/pubsub/pubsub.module';
import { RedisModule, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import { PrismaModule } from './features/util/prisma/prisma.module';
import { CONFIG } from './config';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from './decorators/redis.decorator';
import { BullModule } from '@nestjs/bull';
import { PoliciesModule } from './features/policies/policies.module';
import { ContractsModule } from './features/contracts/contracts.module';

@Module({
  imports: [
    // Util
    PrismaModule,
    RedisModule.forRoot({
      config: [
        {
          namespace: DEFAULT_REDIS_NAMESPACE,
          url: CONFIG.redisUrl,
        },
        {
          namespace: REDIS_PUBLISHER,
          url: CONFIG.redisUrl,
        },
        {
          namespace: REDIS_SUBSCRIBER,
          url: CONFIG.redisUrl,
        },
      ],
    }),
    BullModule.forRoot({
      // Requires separate redis client - https://github.com/OptimalBits/bull/issues/1873
      url: CONFIG.redisUrl,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    ApolloModule,
    PubsubModule,
    ProviderModule,
    // Features
    AccountsModule,
    ApproversModule,
    AuthModule,
    CommentsModule,
    ContactsModule,
    ContractFunctionsModule,
    ContractsModule,
    FaucetModule,
    HealthModule,
    PoliciesModule,
    ProposalsModule,
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
