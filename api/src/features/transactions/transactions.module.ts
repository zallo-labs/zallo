import { forwardRef, Module } from '@nestjs/common';

import { PaymastersModule } from '../paymasters/paymasters.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { TransactionsEvents } from './transactions.events';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';
import { TransactionsWorker } from './transactions.worker';

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
