import { Module } from '@nestjs/common';
import { ContractsResolver } from './contracts.resolver';
import { ContractsService } from './contracts.service';

@Module({
  exports: [ContractsService],
  providers: [ContractsResolver, ContractsService],
})
export class ContractsModule {}
