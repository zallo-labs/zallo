import { forwardRef, Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { TransactionProposalsModule } from '../transaction-proposals/transaction-proposals.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PoliciesEventsProcessor } from './policies.events';
import { PoliciesResolver } from './policies.resolver';
import { PoliciesService } from './policies.service';

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
