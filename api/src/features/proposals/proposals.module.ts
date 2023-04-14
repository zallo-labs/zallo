import { forwardRef, Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { PoliciesModule } from '../policies/policies.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [ExpoModule, forwardRef(() => TransactionsModule), forwardRef(() => PoliciesModule)],
  exports: [ProposalsService],
  providers: [ProposalsResolver, ProposalsService],
})
export class ProposalsModule {}
