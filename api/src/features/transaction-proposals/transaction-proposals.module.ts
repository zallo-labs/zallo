import { Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { TransactionProposalsResolver } from './transaction-proposals.resolver';
import { TransactionProposalsService } from './transaction-proposals.service';
import { SimulationsModule } from '../simulations/simulations.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { PaymastersModule } from '~/features/paymasters/paymasters.module';

@Module({
  imports: [ExpoModule, TransactionsModule, SimulationsModule, ProposalsModule, PaymastersModule],
  exports: [TransactionProposalsService],
  providers: [TransactionProposalsResolver, TransactionProposalsService],
})
export class TransactionProposalsModule {}
