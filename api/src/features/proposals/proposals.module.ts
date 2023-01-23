import { forwardRef, Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { PubsubModule } from '~/features/util/pubsub/pubsub.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [ExpoModule, forwardRef(() => TransactionsModule), PubsubModule],
  exports: [ProposalsService],
  providers: [ProposalsResolver, ProposalsService],
})
export class ProposalsModule {}
