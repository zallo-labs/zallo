import { Module } from '@nestjs/common';

import { OperationsModule } from '../operations/operations.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { SIMULATIONS_QUEUE, SimulationsWorker } from './simulations.worker';

@Module({
  imports: [...registerBullQueue(SIMULATIONS_QUEUE), OperationsModule],
  providers: [SimulationsWorker],
})
export class SimulationsModule {}
