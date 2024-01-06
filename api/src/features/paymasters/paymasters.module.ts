import { forwardRef, Module } from '@nestjs/common';

import { PaymasterEvents } from '~/features/paymasters/paymaster.events';
import { PricesModule } from '~/features/prices/prices.module';
import { TokensModule } from '~/features/tokens/tokens.module';
import { TransactionsModule } from '~/features/transactions/transactions.module';
import { PaymastersResolver } from './paymasters.resolver';
import { PaymastersService } from './paymasters.service';

@Module({
  imports: [PricesModule, forwardRef(() => TransactionsModule), forwardRef(() => TokensModule)],
  exports: [PaymastersService],
  providers: [PaymastersService, PaymastersResolver, PaymasterEvents],
})
export class PaymastersModule {}
