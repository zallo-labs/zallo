import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensResolver } from './tokens.resolver';
import { PaymasterModule } from '../paymaster/paymaster.module';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [PaymasterModule, PricesModule],
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
