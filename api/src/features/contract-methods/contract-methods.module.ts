import { Module } from '@nestjs/common';
import { ContractMethodsResolver } from './contract-methods.resolver';
import { ContractMethodsService } from './contract-methods.service';

@Module({
  providers: [ContractMethodsResolver, ContractMethodsService],
})
export class ContractMethodsModule {}
