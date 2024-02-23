import { Module, forwardRef } from '@nestjs/common';
import { ReceiptsWorker } from './receipts.worker';
import { ReceiptsQueue } from './receipts.queue';
import { SystemTxsService } from './system-txs.service';
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
  exports: [SystemTxsService, ReceiptsWorker],
  providers: [
    SystemTxsService,
    ReceiptsWorker,
    TransactionsEvents,
    SchedulerEvents,
    SchedulerWorker,
  ],
})
export class SystemTxsModule {}
