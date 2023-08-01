import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { SimulationsService } from './simulations.service';

@Module({
  imports: [OperationsModule],
  exports: [SimulationsService],
  providers: [SimulationsService],
})
export class SimulationsModule {}
