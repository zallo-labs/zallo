import { Module, forwardRef } from '@nestjs/common';
import { TransactionsWorker } from './transactions.worker';
import { TransactionsQueue } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { TransactionsResolver } from './transactions.resolver';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { registerBullQueue, registerFlowsProducer } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';
import { SchedulerEvents } from './scheduler.events';
import { SchedulerQueue, SchedulerWorker } from './scheduler.worker';

@Module({
  imports: [
    ...registerBullQueue(TransactionsQueue, SchedulerQueue),
    registerFlowsProducer(),
    ProposalsModule,
    forwardRef(() => PaymastersModule),
  ],
  exports: [TransactionsService, TransactionsWorker],
  providers: [
    TransactionsService,
    TransactionsResolver,
    TransactionsWorker,
    TransactionsEvents,
    SchedulerEvents,
    SchedulerWorker,
  ],
})
export class TransactionsModule {}
