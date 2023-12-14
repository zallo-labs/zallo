import { Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { TransactionProposalsResolver } from './transaction-proposals.resolver';
import { TransactionProposalsService } from './transaction-proposals.service';
import { SimulationsModule } from '../simulations/simulations.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { PaymastersModule } from '~/features/paymasters/paymasters.module';
import { PricesModule } from '~/features/prices/prices.module';
import { TransactionsModule } from '~/features/transactions/transactions.module';
import { registerBullMqQueue } from '~/features/util/bull/bull.util';
import {
  EXECUTIONS_QUEUE,
  ExecutionsWorker,
} from '~/features/transaction-proposals/executions.worker';
import { TRANSACTIONS_QUEUE } from '~/features/transactions/transactions.queue';

@Module({
  imports: [
    ...registerBullMqQueue(EXECUTIONS_QUEUE),
    ...registerBullMqQueue(TRANSACTIONS_QUEUE),
    TransactionsModule,
    ExpoModule,
    SimulationsModule,
    ProposalsModule,
    PricesModule,
    PaymastersModule,
  ],
  exports: [TransactionProposalsService],
  providers: [TransactionProposalsResolver, TransactionProposalsService, ExecutionsWorker],
})
export class TransactionProposalsModule {}
