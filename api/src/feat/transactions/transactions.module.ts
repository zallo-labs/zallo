import { Module, forwardRef } from '@nestjs/common';
import { ExpoModule } from '~/core/expo/expo.module';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';
import { ProposalsModule } from '../proposals/proposals.module';
import { PaymastersModule } from '~/feat/paymasters/paymasters.module';
import { PricesModule } from '~/feat/prices/prices.module';
import { SystemTxsModule } from '~/feat/system-txs/system-txs.module';
import { registerBullQueue, registerFlowsProducer } from '~/core/bull/bull.util';
import { ExecutionsQueue, ExecutionsWorker } from '~/feat/transactions/executions.worker';
import { ConfirmationQueue } from '../system-txs/confirmations.queue';
import { SimulationsQueue } from '~/feat/simulations/simulations.worker';
import { ActivationsModule } from '../activations/activations.module';
import { PoliciesModule } from '../policies/policies.module';
import { TokensModule } from '~/feat/tokens/tokens.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ...registerBullQueue(SimulationsQueue, ExecutionsQueue, ConfirmationQueue),
    registerFlowsProducer(),
    SystemTxsModule,
    ExpoModule,
    ProposalsModule,
    PricesModule,
    PaymastersModule,
    ActivationsModule,
    forwardRef(() => PoliciesModule),
    TokensModule,
    EventsModule,
  ],
  exports: [TransactionsService],
  providers: [TransactionsResolver, TransactionsService, ExecutionsWorker],
})
export class TransactionsModule {}
