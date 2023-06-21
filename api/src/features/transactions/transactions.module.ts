import { Module, forwardRef } from '@nestjs/common';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { ProposalsModule } from '../proposals/proposals.module';
import { TransactionsResolver } from './transactions.resolver';
import { PaymasterModule } from '../paymaster/paymaster.module';
import { registerBullQueue } from '../util/bull/bull.util';

@Module({
  imports: [
    ...registerBullQueue(TRANSACTIONS_QUEUE),
    forwardRef(() => ProposalsModule),
    PaymasterModule,
  ],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsService, TransactionsResolver, TransactionsProcessor, TransactionsEvents],
})
export class TransactionsModule {}
