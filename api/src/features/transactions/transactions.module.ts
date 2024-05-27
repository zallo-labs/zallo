import { Module, forwardRef } from '@nestjs/common';
import { ExpoModule } from '~/features/util/expo/expo.module';
import { TransactionsResolver } from './transactions.resolver';
import { TransactionsService } from './transactions.service';
import { ProposalsModule } from '../proposals/proposals.module';
import { PaymastersModule } from '~/features/paymasters/paymasters.module';
import { PricesModule } from '~/features/prices/prices.module';
import { SystemTxsModule } from '~/features/system-txs/system-txs.module';
import { registerBullQueue, registerFlowsProducer } from '~/features/util/bull/bull.util';
import { ExecutionsQueue, ExecutionsWorker } from '~/features/transactions/executions.worker';
import { ReceiptsQueue } from '~/features/system-txs/receipts.queue';
import { SimulationsQueue } from '~/features/simulations/simulations.worker';
import { ActivationsModule } from '../activations/activations.module';
import { PoliciesModule } from '../policies/policies.module';
import { TokensModule } from '#/tokens/tokens.module';

@Module({
  imports: [
    ...registerBullQueue(SimulationsQueue, ExecutionsQueue, ReceiptsQueue),
    registerFlowsProducer(),
    SystemTxsModule,
    ExpoModule,
    ProposalsModule,
    PricesModule,
    PaymastersModule,
    ActivationsModule,
    forwardRef(() => PoliciesModule),
    TokensModule,
  ],
  exports: [TransactionsService],
  providers: [TransactionsResolver, TransactionsService, ExecutionsWorker],
})
export class TransactionsModule {}
