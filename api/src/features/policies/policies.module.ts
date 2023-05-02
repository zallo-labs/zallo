import { forwardRef, Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoliciesResolver } from './policies.resolver';
import { PoliciesService } from './policies.service';
import { PoliciesEventsProcessor } from './policies.events';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [forwardRef(() => ProposalsModule), forwardRef(() => TransactionsModule), EventsModule],
  exports: [PoliciesService],
  providers: [PoliciesResolver, PoliciesService, PoliciesEventsProcessor],
})
export class PoliciesModule {}
