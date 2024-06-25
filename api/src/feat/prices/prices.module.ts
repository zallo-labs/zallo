import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesWatcher } from './prices.watcher';

@Module({
  exports: [PricesService],
  providers: [PricesService, PricesWatcher],
})
export class PricesModule {}
