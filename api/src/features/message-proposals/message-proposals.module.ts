import { Module } from '@nestjs/common';

import { ProposalsModule } from '../proposals/proposals.module';
import { MessageProposalsResolver } from './message-proposals.resolver';
import { MessageProposalsService } from './message-proposals.service';

@Module({
  imports: [ProposalsModule],
  providers: [MessageProposalsService, MessageProposalsResolver],
})
export class MessageProposalsModule {}
