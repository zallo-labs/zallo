import { Module } from '@nestjs/common';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { TransactionsResolver } from './transactions.resolver';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [...registerBullQueue(TRANSACTIONS_QUEUE), ProposalsModule, PaymastersModule],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsService, TransactionsResolver, TransactionsProcessor, TransactionsEvents],
})
export class TransactionsModule {}
