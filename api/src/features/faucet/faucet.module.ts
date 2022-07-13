import { Module } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { FaucetResolver } from './faucet.resolver';

@Module({
  imports: [ProviderModule],
  providers: [FaucetResolver]
})
export class FaucetModule {}
