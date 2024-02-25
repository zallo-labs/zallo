import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [ProposalsModule],
  providers: [MessagesService, MessagesResolver],
})
export class MessagesModule {}
