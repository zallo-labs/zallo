import { Module, forwardRef } from '@nestjs/common';
import { ReceiptsWorker } from './receipts.worker';
import { ReceiptsQueue } from './receipts.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { registerBullQueue, registerFlowsProducer } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';
import { SchedulerEvents } from './scheduler.events';
import { SchedulerQueue, SchedulerWorker } from './scheduler.worker';

@Module({
  imports: [
    ...registerBullQueue(ReceiptsQueue, SchedulerQueue),
    registerFlowsProducer(),
    ProposalsModule,
    forwardRef(() => PaymastersModule),
  ],
  exports: [TransactionsService, ReceiptsWorker],
  providers: [
    TransactionsService,
    ReceiptsWorker,
    TransactionsEvents,
    SchedulerEvents,
    SchedulerWorker,
  ],
})
export class TransactionsModule {}
