import { forwardRef, Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';
import { ActivationsWorker } from './activations.worker';
import { ACTIVATIONS_QUEUE } from './activations.worker';
import { registerBullQueue } from '../util/bull/bull.util';
import { UpgradeEvents } from '~/features/accounts/upgrades.events';
import { TRANSACTIONS_QUEUE } from '~/features/transactions/transactions.queue';
import { EventsModule } from '~/features/events/events.module';
import { TransactionsModule } from '~/features/transactions/transactions.module';

@Module({
  imports: [
    ...registerBullQueue(ACTIVATIONS_QUEUE),
    ...registerBullQueue(TRANSACTIONS_QUEUE),
    ContractsModule,
    FaucetModule,
    forwardRef(() => PoliciesModule),
    EventsModule,
    TransactionsModule,
  ],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService, ActivationsWorker, UpgradeEvents],
})
export class AccountsModule {}
