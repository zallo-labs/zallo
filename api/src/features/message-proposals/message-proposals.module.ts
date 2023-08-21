import { Module } from '@nestjs/common';
import { MessageProposalsService } from './message-proposals.service';
import { MessageProposalsResolver } from './message-proposals.resolver';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [ProposalsModule],
  providers: [MessageProposalsService, MessageProposalsResolver],
})
export class MessageProposalsModule {}
