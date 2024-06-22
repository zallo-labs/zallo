import { Module } from '@nestjs/common';
import { OperationsResolver } from './operations.resolver';
import { OperationsService } from './operations.service';
import { ContractsModule } from '../contracts/contracts.module';
import { TokensModule } from '~/feat/tokens/tokens.module';

@Module({
  imports: [ContractsModule, TokensModule],
  exports: [OperationsService],
  providers: [OperationsService, OperationsResolver],
})
export class OperationsModule {}
