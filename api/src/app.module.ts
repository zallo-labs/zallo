import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AccountsModule } from './features/accounts/accounts.module';
import { ApproversModule } from './features/approvers/approvers.module';
import { AuthModule } from './features/auth/auth.module';
import { AuthGuard } from './features/auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { NetworksModule } from './features/util/networks/networks.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { DatabaseModule } from './features/database/database.module';
import { ContractFunctionsModule } from './features/contract-functions/contract-functions.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { SystemTxsModule } from './features/system-txs/system-txs.module';
import { FaucetModule } from './features/faucet/faucet.module';
import { ExpoModule } from './features/util/expo/expo.module';
import { PubsubModule } from './features/util/pubsub/pubsub.module';
import { PoliciesModule } from './features/policies/policies.module';
import { ContractsModule } from './features/contracts/contracts.module';
import { TransfersModule } from './features/transfers/transfers.module';
import { EventsModule } from './features/events/events.module';
import { RedisModule } from './features/util/redis/redis.module';
import { PaymastersModule } from './features/paymasters/paymasters.module';
import { SentryModule } from './features/util/sentry/sentry.module';
import { SentryInterceptor } from './features/util/sentry/sentry.interceptor';
import { OperationsModule } from './features/operations/operations.module';
import { SimulationsModule } from './features/simulations/simulations.module';
import { BullModule } from './features/util/bull/bull.module';
import { TokensModule } from './features/tokens/tokens.module';
import { PricesModule } from './features/prices/prices.module';
import { MessagesModule } from './features/messages/messages.module';
import { ProposalsModule } from './features/proposals/proposals.module';
import { BalancesModule } from '~/features/util/balances/balances.module';
import { NodesModule } from './features/nodes/nodes.module';

@Module({
  imports: [
    // Util
    SentryModule.forRoot(),
    DatabaseModule,
    RedisModule,
    BullModule,
    ApolloModule,
    PubsubModule,
    NetworksModule,
    BalancesModule,
    // Features
    AccountsModule,
    ApproversModule,
    AuthModule,
    ContactsModule,
    ContractFunctionsModule,
    ContractsModule,
    EventsModule,
    FaucetModule,
    HealthModule,
    MessagesModule,
    NodesModule,
    OperationsModule,
    PaymastersModule,
    PoliciesModule,
    PricesModule,
    ProposalsModule,
    SimulationsModule,
    SystemTxsModule,
    TokensModule,
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
