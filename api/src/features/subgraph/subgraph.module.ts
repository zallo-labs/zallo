import { Module } from '@nestjs/common';
import { ProviderModule } from '../util/provider/provider.module';
import { SubgraphService } from './subgraph.service';

@Module({
  imports: [ProviderModule],
  exports: [SubgraphService],
  providers: [SubgraphService],
})
export class SubgraphModule {}
