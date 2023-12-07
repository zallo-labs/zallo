import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensResolver } from './tokens.resolver';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { PricesModule } from '../prices/prices.module';
import { BalancesModule } from '~/features/util/balances/balances.module';

@Module({
  imports: [PaymastersModule, BalancesModule, PricesModule],
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
