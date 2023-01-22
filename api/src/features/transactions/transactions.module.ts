import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { TransactionsConsumer } from './transactions.consumer';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    BullModule.registerQueue(TransactionsService.QUEUE_OPTIONS),
    forwardRef(() => ProposalsModule),
    SubgraphModule,
  ],
  exports: [TransactionsService],
  providers: [TransactionsResolver, TransactionsService, TransactionsConsumer],
})
export class TransactionsModule {}
