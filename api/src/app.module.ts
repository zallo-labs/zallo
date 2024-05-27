import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ContextModule } from '#/util/context/context.module';
import { ContextInterceptor } from '#/util/context/context.interceptor';
import { HealthModule } from '#//health/health.module';
import { UsersModule } from '#//users/users.module';
import { AccountsModule } from '#//accounts/accounts.module';
import { ApproversModule } from '#//approvers/approvers.module';
import { AuthModule } from '#//auth/auth.module';
import { AuthGuard } from '#//auth/auth.guard';
import { ApolloModule } from './apollo/apollo.module';
import { NetworksModule } from '#//util/networks/networks.module';
import { ContactsModule } from '#//contacts/contacts.module';
import { DatabaseModule } from '#//database/database.module';
import { ContractFunctionsModule } from '#//contract-functions/contract-functions.module';
import { TransactionsModule } from '#//transactions/transactions.module';
import { SystemTxsModule } from '#//system-txs/system-txs.module';
import { FaucetModule } from '#//faucet/faucet.module';
import { ExpoModule } from '#//util/expo/expo.module';
import { PubsubModule } from '#//util/pubsub/pubsub.module';
import { PoliciesModule } from '#//policies/policies.module';
import { ContractsModule } from '#//contracts/contracts.module';
import { TransfersModule } from '#//transfers/transfers.module';
import { EventsModule } from '#//events/events.module';
import { RedisModule } from '#//util/redis/redis.module';
import { PaymastersModule } from '#//paymasters/paymasters.module';
import { SentryModule } from '#//util/sentry/sentry.module';
import { SentryInterceptor } from '#//util/sentry/sentry.interceptor';
import { OperationsModule } from '#//operations/operations.module';
import { SimulationsModule } from '#//simulations/simulations.module';
import { BullModule } from '#//util/bull/bull.module';
import { TokensModule } from '#//tokens/tokens.module';
import { PricesModule } from '#//prices/prices.module';
import { MessagesModule } from '#//messages/messages.module';
import { ProposalsModule } from '#//proposals/proposals.module';
import { BalancesModule } from '#/util/balances/balances.module';
import { NodesModule } from '#//nodes/nodes.module';

@Module({
  imports: [
    // Util
    ContextModule,
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
    { provide: APP_INTERCEPTOR, useClass: SentryInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ContextInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
