import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { EventsModule } from '../events/events.module';
import { TransfersEvents } from './transfers.events';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [EventsModule, TransactionsModule, EventsModule],
  providers: [TransfersService, TransfersResolver, TransfersEvents],
})
export class TransfersModule {}
