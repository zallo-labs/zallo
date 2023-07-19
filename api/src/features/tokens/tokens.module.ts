import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensResolver } from './tokens.resolver';
import { PricesModule } from '../prices/prices.module';

@Module({
  imports: [PricesModule],
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
