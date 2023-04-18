import { Module } from '@nestjs/common';
import { SubgraphService } from './subgraph.service';

@Module({
  exports: [SubgraphService],
  providers: [SubgraphService],
})
export class SubgraphModule {}
