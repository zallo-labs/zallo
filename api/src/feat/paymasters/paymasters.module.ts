import { Module, forwardRef } from '@nestjs/common';
import { PaymastersService } from './paymasters.service';
import { PaymastersResolver } from './paymasters.resolver';
import { PricesModule } from '~/feat/prices/prices.module';
import { SystemTxsModule } from '~/feat/system-txs/system-txs.module';
import { TokensModule } from '~/feat/tokens/tokens.module';
import { ActivationsModule } from '../activations/activations.module';

@Module({
  imports: [
    PricesModule,
    forwardRef(() => SystemTxsModule),
    forwardRef(() => TokensModule),
    ActivationsModule,
  ],
  exports: [PaymastersService],
  providers: [PaymastersService, PaymastersResolver],
})
export class PaymastersModule {}
