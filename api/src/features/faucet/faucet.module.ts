import { Module } from '@nestjs/common';

import { BalancesModule } from '~/features/util/balances/balances.module';
import { FaucetResolver } from './faucet.resolver';
import { FaucetService } from './faucet.service';

@Module({
  imports: [BalancesModule],
  exports: [FaucetService],
  providers: [FaucetResolver, FaucetService],
})
export class FaucetModule {}
