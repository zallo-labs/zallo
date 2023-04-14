import { Module } from '@nestjs/common';
import { ContractFunctionsResolver } from './contract-functions.resolver';
import { ContractFunctionsService } from './contract-functions.service';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [ContractsModule],
  providers: [ContractFunctionsResolver, ContractFunctionsService],
})
export class ContractFunctionsModule {}
