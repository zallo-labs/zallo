import { Module } from '@nestjs/common';

import { PricesService } from './prices.service';

@Module({
  exports: [PricesService],
  providers: [PricesService],
})
export class PricesModule {}
