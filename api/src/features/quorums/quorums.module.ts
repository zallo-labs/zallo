import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { QuorumsResolver } from './quorums.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [QuorumsResolver],
})
export class QuorumsModule {}
