import { forwardRef, Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { SystemTxsModule } from '../system-txs/system-txs.module';
import { PoliciesResolver } from './policies.resolver';
import { PoliciesService } from './policies.service';
import { PoliciesEventsProcessor } from './policies.events';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [forwardRef(() => TransactionsModule), forwardRef(() => SystemTxsModule), EventsModule],
  exports: [PoliciesService],
  providers: [PoliciesResolver, PoliciesService, PoliciesEventsProcessor],
})
export class PoliciesModule {}
