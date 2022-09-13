import { Module } from '@nestjs/common';
import { SubmissionsModule } from '../submissions/submissions.module';
import { ProposalsResolver } from './proposals.resolver';

@Module({
  imports: [SubmissionsModule],
  providers: [ProposalsResolver],
})
export class ProposalsModule {}
