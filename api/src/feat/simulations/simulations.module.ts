import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { registerBullQueue } from '~/core/bull/bull.util';
import { SimulationsQueue, SimulationsWorker } from './simulations.worker';
import { TokensModule } from '../tokens/tokens.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ...registerBullQueue(SimulationsQueue),
    OperationsModule,
    TokensModule,
    ProposalsModule,
    EventsModule,
  ],
  providers: [SimulationsWorker],
})
export class SimulationsModule {}
