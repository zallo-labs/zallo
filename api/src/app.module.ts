import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { AuthModule } from './features/auth/auth.module';
import { AuthGuard } from './features/auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { ProviderModule } from './features/util/provider/provider.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { DatabaseModule } from './features/database/database.module';
import { ContractFunctionsModule } from './features/contract-functions/contract-functions.module';
import { TransactionProposalsModule } from './features/transaction-proposals/transaction-proposals.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { ExpoModule } from './features/util/expo/expo.module';
import { PubsubModule } from './features/util/pubsub/pubsub.module';
import { PoliciesModule } from './features/policies/policies.module';
import { ContractsModule } from './features/contracts/contracts.module';
import { ExplorerModule } from './features/explorer/explorer.module';
import { TransfersModule } from './features/transfers/transfers.module';
import { EventsModule } from './features/events/events.module';
import { RedisModule } from './features/util/redis/redis.module';
import { ReceiptsModule } from './features/receipts/receipts.module';
import { PaymasterModule } from './features/paymaster/paymaster.module';
import { SentryModule } from './features/util/sentry/sentry.module';
import { SentryInterceptor } from './features/util/sentry/sentry.interceptor';
import { OperationsModule } from './features/operations/operations.module';
import { SimulationsModule } from './features/simulations/simulations.module';
import { BullModule } from './features/util/bull/bull.module';
import { TokensModule } from './features/tokens/tokens.module';
import { PricesModule } from './features/prices/prices.module';

@Module({
  imports: [
    // Util
    SentryModule.forRoot(),
    DatabaseModule,
    RedisModule,
    BullModule,
    ApolloModule,
    PubsubModule,
    ProviderModule,
    // Features
    AccountsModule,
    ApproversModule,
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
    PricesModule,
    ReceiptsModule,
    SimulationsModule,
    TokensModule,
    TransactionProposalsModule,
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
