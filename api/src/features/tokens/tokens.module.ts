import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensResolver } from './tokens.resolver';

@Module({
  providers: [TokensService, TokensResolver],
})
export class TokensModule {}
