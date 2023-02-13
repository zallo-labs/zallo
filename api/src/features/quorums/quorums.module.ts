import { forwardRef, Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { QuorumsResolver } from './quorums.resolver';
import { QuorumsService } from './quorums.service';

@Module({
  imports: [forwardRef(() => ProposalsModule), forwardRef(() => TransactionsModule)],
  exports: [QuorumsService],
  providers: [QuorumsResolver, QuorumsService],
})
export class QuorumsModule {}
