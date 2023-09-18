import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { SIMULATIONS_QUEUE, SimulationsProcessor } from './simulations.processor';
import { SimulationsService } from './simulations.service';

@Module({
  imports: [...registerBullQueue(SIMULATIONS_QUEUE), OperationsModule],
  exports: [SimulationsService],
  providers: [SimulationsService, SimulationsProcessor],
})
export class SimulationsModule {}
