import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { ProposalsModule } from '../proposals/proposals.module';
import { PoliciesModule } from '../policies/policies.module';

@Module({
  imports: [ProposalsModule, PoliciesModule],
  providers: [MessagesService, MessagesResolver],
})
export class MessagesModule {}
