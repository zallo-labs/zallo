import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { AuthModule } from './features/auth/auth.module';
import { AuthGuard } from './features/auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './features/util/provider/provider.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { DatabaseModule } from './features/database/database.module';
import { ContractFunctionsModule } from './features/contract-functions/contract-functions.module';
import { ProposalsModule } from './features/proposals/proposals.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { ExpoModule } from './features/util/expo/expo.module';
import { PubsubModule } from './features/util/pubsub/pubsub.module';
import { CONFIG } from './config';
import { BullModule } from '@nestjs/bull';
import { PoliciesModule } from './features/policies/policies.module';
import { ContractsModule } from './features/contracts/contracts.module';
import { ExplorerModule } from './features/explorer/explorer.module';
import { TransfersModule } from './features/transfers/transfers.module';
import { EventsModule } from './features/events/events.module';
import { REDIS_OPTIONS, RedisModule } from './features/util/redis/redis.module';
import { ReceiptsModule } from './features/receipts/receipts.module';
import { PaymasterModule } from './features/paymaster/paymaster.module';
import { SentryModule } from './features/util/sentry/sentry.module';
import { SentryInterceptor } from './features/util/sentry/sentry.interceptor';
import { OperationsModule } from './features/operations/operations.module';

@Module({
  imports: [
    // Util
    SentryModule.forRoot(),
    DatabaseModule,
    RedisModule,
    BullModule.forRoot({
      // Requires separate redis client - https://github.com/OptimalBits/bull/issues/1873
      url: CONFIG.redisUrl,
      redis: REDIS_OPTIONS,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 18, // 2^18 * 200ms = ~14.5h
        backoff: { type: 'exponential', delay: 200 },
      },
    }),
    ApolloModule,
    PubsubModule,
    ProviderModule,
    // Features
    AccountsModule,
    AuthModule,
    ContactsModule,
    ContractFunctionsModule,
    ContractsModule,
    EventsModule,
    ExplorerModule,
    FaucetModule,
    HealthModule,
    OperationsModule,
    PaymasterModule,
    PoliciesModule,
    ProposalsModule,
    ReceiptsModule,
    TransactionsModule,
    TransfersModule,
    UsersModule,
    ExpoModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
