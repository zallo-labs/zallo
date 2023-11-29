import { Module } from '@nestjs/common';
import { FaucetResolver } from './faucet.resolver';
import { FaucetService } from './faucet.service';
import { BalancesModule } from '~/features/util/balances/balances.module';

@Module({
  imports: [BalancesModule],
  exports: [FaucetService],
  providers: [FaucetResolver, FaucetService],
})
export class FaucetModule {}
