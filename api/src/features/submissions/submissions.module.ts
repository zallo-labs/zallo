import { Module } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { SubgraphModule } from '../subgraph/subgraph.module';
import { SubmissionsResolver } from './submissions.resolver';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [ProviderModule, SubgraphModule],
  exports: [SubmissionsService],
  providers: [SubmissionsResolver, SubmissionsService],
})
export class SubmissionsModule {}
