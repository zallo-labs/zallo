import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CONFIG } from './config';
import { ContextModule } from '~/core/context/context.module';
import { ContextInterceptor } from '~/core/context/context.interceptor';
import { HealthModule } from '~/feat/health/health.module';
import { UsersModule } from '~/feat/users/users.module';
import { AccountsModule } from '~/feat/accounts/accounts.module';
import { ApproversModule } from '~/feat/approvers/approvers.module';
import { AuthModule } from '~/feat/auth/auth.module';
import { AuthGuard } from '~/feat/auth/auth.guard';
import { ApolloModule } from './core/apollo/apollo.module';
import { NetworksModule } from '~/core/networks/networks.module';
import { ContactsModule } from '~/feat/contacts/contacts.module';
import { DatabaseModule } from '~/core/database/database.module';
import { ContractFunctionsModule } from '~/feat/contract-functions/contract-functions.module';
import { TransactionsModule } from '~/feat/transactions/transactions.module';
import { SystemTxsModule } from '~/feat/system-txs/system-txs.module';
import { FaucetModule } from '~/feat/faucet/faucet.module';
import { ExpoModule } from '~/core/expo/expo.module';
import { PubsubModule } from '~/core/pubsub/pubsub.module';
import { PoliciesModule } from '~/feat/policies/policies.module';
import { ContractsModule } from '~/feat/contracts/contracts.module';
import { TransfersModule } from '~/feat/transfers/transfers.module';
import { EventsModule } from '~/feat/events/events.module';
import { RedisModule } from '~/core/redis/redis.module';
import { PaymastersModule } from '~/feat/paymasters/paymasters.module';
import { SentryModule } from '~/core/sentry/sentry.module';
import { SentryInterceptor } from '~/core/sentry/sentry.interceptor';
import { OperationsModule } from '~/feat/operations/operations.module';
import { SimulationsModule } from '~/feat/simulations/simulations.module';
import { BullModule } from '~/core/bull/bull.module';
import { TokensModule } from '~/feat/tokens/tokens.module';
import { PricesModule } from '~/feat/prices/prices.module';
import { MessagesModule } from '~/feat/messages/messages.module';
import { ProposalsModule } from '~/feat/proposals/proposals.module';
import { BalancesModule } from '~/core/balances/balances.module';
import { NodesModule } from '~/feat/nodes/nodes.module';
import { ActivationsModule } from '~/feat/activations/activations.module';

@Module({
  imports: [
    // Core
    ApolloModule,
    BalancesModule,
    BullModule,
    ContextModule,
    DatabaseModule,
    ExpoModule,
    NetworksModule,
    PubsubModule,
    RedisModule,
    SentryModule.forRoot(),
    // Features
    AccountsModule,
    ActivationsModule,
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
  ],
  providers: [
    !!CONFIG.sentryDsn && { provide: APP_INTERCEPTOR, useClass: SentryInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ContextInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
  ].filter(Boolean),
})
export class AppModule {}
