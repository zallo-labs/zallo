import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { SimulationsQueue, SimulationsWorker } from './simulations.worker';

@Module({
  imports: [...registerBullQueue(SimulationsQueue), OperationsModule],
  providers: [SimulationsWorker],
})
export class SimulationsModule {}
