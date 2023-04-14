import { forwardRef, Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoliciesResolver } from './policies.resolver';
import { PoliciesService } from './policies.service';

@Module({
  imports: [forwardRef(() => ProposalsModule), forwardRef(() => TransactionsModule)],
  exports: [PoliciesService],
  providers: [PoliciesResolver, PoliciesService],
})
export class PoliciesModule {}
