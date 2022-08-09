import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { WalletsResolver } from './wallets.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [WalletsResolver],
})
export class WalletsModule {}
