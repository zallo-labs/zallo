import { Module } from '@nestjs/common';
import { OperationsResolver } from './operations.resolver';
import { OperationsService } from './operations.service';
import { ContractFunctionsModule } from '../contract-functions/contract-functions.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [ContractFunctionsModule, ContractsModule],
  providers: [OperationsService, OperationsResolver],
})
export class OperationsModule {}
