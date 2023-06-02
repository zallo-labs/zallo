import { Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';
import { PaymasterModule } from '../paymaster/paymaster.module';

@Module({
  imports: [ExpoModule, TransactionsModule, PaymasterModule],
  exports: [ProposalsService],
  providers: [ProposalsResolver, ProposalsService],
})
export class ProposalsModule {}
