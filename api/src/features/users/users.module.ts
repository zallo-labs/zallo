import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [UsersResolver],
})
export class UsersModule {}
