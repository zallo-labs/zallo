import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsResolver } from './proposals.resolver';

@Module({
  providers: [ProposalsService, ProposalsResolver],
  exports: [ProposalsService],
})
export class ProposalsModule {}
