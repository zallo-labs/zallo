import { Module } from '@nestjs/common';

import { TokensModule } from '~/features/tokens/tokens.module';
import { ContractsModule } from '../contracts/contracts.module';
import { OperationsResolver } from './operations.resolver';
import { OperationsService } from './operations.service';

@Module({
  imports: [ContractsModule, TokensModule],
  exports: [OperationsService],
  providers: [OperationsService, OperationsResolver],
})
export class OperationsModule {}
