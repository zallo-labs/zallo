import { forwardRef, Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { QuorumsResolver } from './quorums.resolver';
import { QuorumsService } from './quorums.service';

@Module({
  imports: [forwardRef(() => ProposalsModule)],
  exports: [QuorumsService],
  providers: [QuorumsResolver, QuorumsService],
})
export class QuorumsModule {}
