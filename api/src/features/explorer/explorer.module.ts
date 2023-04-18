import { Module } from '@nestjs/common';
import { ExplorerService } from './explorer.service';

@Module({
  providers: [ExplorerService],
  exports: [ExplorerService],
})
export class ExplorerModule {}
