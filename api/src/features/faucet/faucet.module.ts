import { Module } from '@nestjs/common';
import { FaucetResolver } from './faucet.resolver';
import { FaucetService } from './faucet.service';

@Module({
  exports: [FaucetService],
  providers: [FaucetResolver, FaucetService],
})
export class FaucetModule {}
