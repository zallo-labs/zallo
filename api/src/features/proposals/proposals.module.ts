import { Module } from '@nestjs/common';
import { ExpoModule } from '~/expo/expo.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { UsersModule } from '../users/users.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [ExpoModule, SubmissionsModule, UsersModule],
  providers: [ProposalsResolver, ProposalsService],
})
export class ProposalsModule {}
