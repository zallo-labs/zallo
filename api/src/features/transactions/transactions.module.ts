import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { PoliciesModule } from '../policies/policies.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { TransactionsProcessor } from './transactions.processor';
import { TRANSACTIONS_QUEUE } from './transactions.queue';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';
import { ExplorerModule } from '../explorer/explorer.module';

@Module({
  imports: [
    BullModule.registerQueue(TRANSACTIONS_QUEUE),
    forwardRef(() => ProposalsModule),
    forwardRef(() => PoliciesModule),
    SubgraphModule,
    ExplorerModule,
  ],
  exports: [TransactionsService, TransactionsProcessor],
  providers: [TransactionsResolver, TransactionsService, TransactionsProcessor],
})
export class TransactionsModule {}
