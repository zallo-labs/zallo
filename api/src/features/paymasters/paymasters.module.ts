import { Module, forwardRef } from '@nestjs/common';
import { PaymastersService } from './paymasters.service';
import { PaymastersResolver } from './paymasters.resolver';
import { PricesModule } from '~/features/prices/prices.module';
import { PaymasterEvents } from '~/features/paymasters/paymaster.events';
import { TransactionsModule } from '~/features/transactions/transactions.module';

@Module({
  imports: [PricesModule, forwardRef(() => TransactionsModule)],
  exports: [PaymastersService],
  providers: [PaymastersService, PaymastersResolver, PaymasterEvents],
})
export class PaymastersModule {}
