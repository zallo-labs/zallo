import { forwardRef, Module } from '@nestjs/common';
import { QuorumsModule } from '../quorums/quorums.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [SubgraphModule, forwardRef(() => QuorumsModule)],
  exports: [TransactionsService],
  providers: [TransactionsResolver, TransactionsService],
})
export class TransactionsModule {}
