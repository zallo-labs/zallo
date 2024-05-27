import { Module } from '@nestjs/common';
import { ReceiptsWorker } from './receipts.worker';
import { ReceiptsQueue } from './receipts.queue';
import { TransactionsEvents } from './transactions.events';
import { registerBullQueue, registerFlowsProducer } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';
import { SchedulerEvents } from './scheduler.events';
import { TokensModule } from '#/tokens/tokens.module';
import { PricesModule } from '#/prices/prices.module';
import { ExecutionsQueue } from '#/transactions/executions.worker';

@Module({
  imports: [
    ...registerBullQueue(ReceiptsQueue, ExecutionsQueue),
    registerFlowsProducer(),
    ProposalsModule,
    TokensModule,
    PricesModule,
  ],
  exports: [ReceiptsWorker],
  providers: [ReceiptsWorker, TransactionsEvents, SchedulerEvents],
})
export class SystemTxsModule {}
