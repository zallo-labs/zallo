import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { ProposalsModule } from '../proposals/proposals.module';
import { TransactionsResolver } from './transactions.resolver';
import { PaymasterModule } from '../paymaster/paymaster.module';

@Module({
  imports: [
    BullModule.registerQueue(TRANSACTIONS_QUEUE),
    forwardRef(() => ProposalsModule),
    PaymasterModule,
  ],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsService, TransactionsResolver, TransactionsProcessor, TransactionsEvents],
})
export class TransactionsModule {}
