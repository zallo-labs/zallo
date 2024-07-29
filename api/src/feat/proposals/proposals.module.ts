import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsResolver } from './proposals.resolver';
import { ExpoModule } from '~/core/expo/expo.module';

@Module({
  imports: [ExpoModule],
  providers: [ProposalsService, ProposalsResolver],
  exports: [ProposalsService],
})
export class ProposalsModule {}
