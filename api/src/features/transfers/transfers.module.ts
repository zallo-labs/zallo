import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { ExplorerModule } from '../explorer/explorer.module';

@Module({
  imports: [ExplorerModule],
  providers: [TransfersService, TransfersResolver],
})
export class TransfersModule {}
