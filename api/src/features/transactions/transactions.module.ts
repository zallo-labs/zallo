import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsService } from './transactions.service';
import { TransactionsEvents } from './transactions.events';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [BullModule.registerQueue(TRANSACTIONS_QUEUE), forwardRef(() => ProposalsModule)],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsService, TransactionsProcessor, TransactionsEvents],
})
export class TransactionsModule {}
