import { Module, forwardRef } from '@nestjs/common';
import { TransactionsWorker } from './transactions.worker';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { TransactionsResolver } from './transactions.resolver';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [
    ...registerBullQueue(TRANSACTIONS_QUEUE),
    ProposalsModule,
    forwardRef(() => PaymastersModule),
  ],
  exports: [TransactionsService, TransactionsWorker],
  providers: [TransactionsService, TransactionsResolver, TransactionsWorker, TransactionsEvents],
})
export class TransactionsModule {}
