import { Module } from '@nestjs/common';
import { ContractsResolver } from './contracts.resolver';
import { ContractsService } from './contracts.service';
import { ExplorerModule } from '../explorer/explorer.module';

@Module({
  imports: [ExplorerModule],
  exports: [ContractsService],
  providers: [ContractsResolver, ContractsService],
})
export class ContractsModule {}
