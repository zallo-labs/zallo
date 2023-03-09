import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { PoliciesModule } from '../policies/policies.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { TransactionsConsumer } from './transactions.consumer';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    BullModule.registerQueue(TRANSACTIONS_QUEUE),
    forwardRef(() => ProposalsModule),
    forwardRef(() => PoliciesModule),
    SubgraphModule,
  ],
  exports: [TransactionsService, TransactionsConsumer],
  providers: [TransactionsConsumer, TransactionsResolver, TransactionsService],
})
export class TransactionsModule {}
