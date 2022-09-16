import { Module } from '@nestjs/common';
import { ProposalsResolver } from './proposals.resolver';

@Module({
  providers: [ProposalsResolver],
})
export class ProposalsModule {}
