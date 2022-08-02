import { Module } from '@nestjs/common';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { AccountsResolver } from './accounts.resolver';

@Module({
  imports: [SubgraphModule],
  providers: [AccountsResolver],
})
export class AccountsModule {}
