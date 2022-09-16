import { Module } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { SubmissionsResolver } from './submissions.resolver';

@Module({
  imports: [ProviderModule, SubgraphModule],
  providers: [SubmissionsResolver],
})
export class SubmissionsModule {}
