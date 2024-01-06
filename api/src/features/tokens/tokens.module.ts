import { forwardRef, Module } from '@nestjs/common';

import { BalancesModule } from '~/features/util/balances/balances.module';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { PricesModule } from '../prices/prices.module';
import { TokensResolver } from './tokens.resolver';
import { TokensService } from './tokens.service';

@Module({
  imports: [forwardRef(() => PaymastersModule), BalancesModule, PricesModule],
  exports: [TokensService],
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
