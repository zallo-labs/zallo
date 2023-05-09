import { Global, Module } from '@nestjs/common';
import { ProviderHealthIndicator } from './provider.health';
import { ProviderService } from './provider.service';

@Global()
@Module({
  exports: [ProviderService, ProviderHealthIndicator],
  providers: [ProviderService, ProviderHealthIndicator],
})
export class ProviderModule {}
