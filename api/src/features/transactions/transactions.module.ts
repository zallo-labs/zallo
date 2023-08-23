import { Module } from '@nestjs/common';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { TransactionsResolver } from './transactions.resolver';
import { PaymasterModule } from '../paymaster/paymaster.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [...registerBullQueue(TRANSACTIONS_QUEUE), ProposalsModule, PaymasterModule],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsService, TransactionsResolver, TransactionsProcessor, TransactionsEvents],
})
export class TransactionsModule {}
