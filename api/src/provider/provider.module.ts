import { Global, Module } from '@nestjs/common';
import { ProviderService } from './provider.service';

@Global()
@Module({
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
