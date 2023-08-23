import { forwardRef, Module } from '@nestjs/common';
import { TransactionProposalsModule } from '../transaction-proposals/transaction-proposals.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoliciesResolver } from './policies.resolver';
import { PoliciesService } from './policies.service';
import { PoliciesEventsProcessor } from './policies.events';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    forwardRef(() => TransactionProposalsModule),
    forwardRef(() => TransactionsModule),
    EventsModule,
  ],
  exports: [PoliciesService],
  providers: [PoliciesResolver, PoliciesService, PoliciesEventsProcessor],
})
export class PoliciesModule {}
