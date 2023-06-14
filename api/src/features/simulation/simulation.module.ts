import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { SimulationService } from './simulation.service';

@Module({
  imports: [OperationsModule],
  exports: [SimulationService],
  providers: [SimulationService],
})
export class SimulationModule {}
