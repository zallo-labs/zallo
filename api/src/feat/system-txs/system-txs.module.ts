import { Module } from '@nestjs/common';
import { ConfirmationsWorker } from './confirmations.worker';
import { ConfirmationQueue } from './confirmations.queue';
import { TransactionsEvents } from './transactions.events';
import { registerBullQueue, registerFlowsProducer } from '~/core/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';
import { SchedulerEvents } from './scheduler.events';
import { TokensModule } from '~/feat/tokens/tokens.module';
import { PricesModule } from '~/feat/prices/prices.module';
import { ExecutionsQueue } from '~/feat/transactions/executions.worker';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ...registerBullQueue(ConfirmationQueue, ExecutionsQueue),
    registerFlowsProducer(),
    ProposalsModule,
    TokensModule,
    PricesModule,
    EventsModule,
  ],
  exports: [ConfirmationsWorker],
  providers: [ConfirmationsWorker, TransactionsEvents, SchedulerEvents],
})
export class SystemTxsModule {}
