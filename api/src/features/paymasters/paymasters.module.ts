import { Module, forwardRef } from '@nestjs/common';
import { PaymastersService } from './paymasters.service';
import { PaymastersResolver } from './paymasters.resolver';
import { PricesModule } from '~/features/prices/prices.module';
import { PaymasterEvents } from '~/features/paymasters/paymaster.events';
import { SystemTxsModule } from '~/features/system-txs/system-txs.module';
import { TokensModule } from '~/features/tokens/tokens.module';
import { ActivationsModule } from '../activations/activations.module';

@Module({
  imports: [
    PricesModule,
    forwardRef(() => SystemTxsModule),
    forwardRef(() => TokensModule),
    ActivationsModule,
  ],
  exports: [PaymastersService],
  providers: [PaymastersService, PaymastersResolver, PaymasterEvents],
})
export class PaymastersModule {}
