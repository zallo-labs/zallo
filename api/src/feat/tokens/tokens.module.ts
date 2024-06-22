import { Module, forwardRef } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensResolver } from './tokens.resolver';
import { PaymastersModule } from '../paymasters/paymasters.module';
import { PricesModule } from '../prices/prices.module';
import { BalancesModule } from '~/core/balances/balances.module';

@Module({
  imports: [forwardRef(() => PaymastersModule), BalancesModule, PricesModule],
  exports: [TokensService],
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
