import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesResolver } from './prices.resolver';

@Module({
  exports: [PricesService],
  providers: [PricesService, PricesResolver],
})
export class PricesModule {}
