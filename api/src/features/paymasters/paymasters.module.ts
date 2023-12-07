import { Module } from '@nestjs/common';
import { PaymastersService } from './paymasters.service';
import { PaymastersResolver } from './paymasters.resolver';
import { PricesModule } from '~/features/prices/prices.module';

@Module({
  imports: [PricesModule],
  exports: [PaymastersService],
  providers: [PaymastersService, PaymastersResolver],
})
export class PaymastersModule {}
