import { Module } from '@nestjs/common';
import { ProviderModule } from '../../provider/provider.module';
import { SafesResolver } from './safes.resolver';

@Module({
  imports: [ProviderModule],
  providers: [SafesResolver],
})
export class SafesModule {}
