import { forwardRef, Module } from '@nestjs/common';

import { ContractsModule } from '../contracts/contracts.module';
import { FaucetModule } from '../faucet/faucet.module';
import { PoliciesModule } from '../policies/policies.module';
import { registerBullQueue } from '../util/bull/bull.util';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ACTIVATIONS_QUEUE } from './activations.queue';
import { ActivationsWorker } from './activations.worker';

@Module({
  imports: [
    ...registerBullQueue(ACTIVATIONS_QUEUE),
    ContractsModule,
    FaucetModule,
    forwardRef(() => PoliciesModule),
  ],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService, ActivationsWorker],
})
export class AccountsModule {}
