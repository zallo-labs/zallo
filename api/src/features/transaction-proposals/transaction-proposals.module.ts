import { Module } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { TransactionProposalsResolver } from './transaction-proposals.resolver';
import { TransactionProposalsService } from './transaction-proposals.service';
import { ProposalsModule } from '../proposals/proposals.module';
import { PaymastersModule } from '~/features/paymasters/paymasters.module';
import { PricesModule } from '~/features/prices/prices.module';
import { TransactionsModule } from '~/features/transactions/transactions.module';
import { registerBullQueue, registerFlowsProducer } from '~/features/util/bull/bull.util';
import {
  ExecutionsQueue,
  ExecutionsWorker,
} from '~/features/transaction-proposals/executions.worker';
import { ReceiptsQueue } from '~/features/transactions/receipts.queue';
import { SimulationsQueue } from '~/features/simulations/simulations.worker';
import { ActivationsModule } from '../activations/activations.module';

@Module({
  imports: [
    ...registerBullQueue(SimulationsQueue, ExecutionsQueue, ReceiptsQueue),
    registerFlowsProducer(),
    TransactionsModule,
    ExpoModule,
    ProposalsModule,
    PricesModule,
    PaymastersModule,
    ActivationsModule,
  ],
  exports: [TransactionProposalsService],
  providers: [TransactionProposalsResolver, TransactionProposalsService, ExecutionsWorker],
})
export class TransactionProposalsModule {}
