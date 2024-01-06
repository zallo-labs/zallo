import { Module } from '@nestjs/common';

import { ContractsModule } from '../contracts/contracts.module';
import { ContractFunctionsResolver } from './contract-functions.resolver';
import { ContractFunctionsService } from './contract-functions.service';

@Module({
  imports: [ContractsModule],
  providers: [ContractFunctionsResolver, ContractFunctionsService],
  exports: [ContractFunctionsService],
})
export class ContractFunctionsModule {}
