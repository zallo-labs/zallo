import { Module } from '@nestjs/common';
import { ExpoModule } from '~/expo/expo.module';
import { ProposalsResolver } from './proposals.resolver';

@Module({
  imports: [ExpoModule],
  providers: [ProposalsResolver],
})
export class ProposalsModule {}
