import { Module } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { FaucetResolver } from './faucet.resolver';
import { FaucetService } from './faucet.service';

@Module({
  imports: [ProviderModule],
  exports: [FaucetService],
  providers: [FaucetResolver, FaucetService],
})
export class FaucetModule {}
