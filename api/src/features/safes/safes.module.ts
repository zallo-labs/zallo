import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { SafesResolver } from './safes.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [SafesResolver],
})
export class SafesModule {}
