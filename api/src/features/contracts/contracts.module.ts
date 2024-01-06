import { Module } from '@nestjs/common';

import { ExplorerModule } from '../explorer/explorer.module';
import { ContractsResolver } from './contracts.resolver';
import { ContractsService } from './contracts.service';

@Module({
  imports: [ExplorerModule],
  exports: [ContractsService],
  providers: [ContractsResolver, ContractsService],
})
export class ContractsModule {}
