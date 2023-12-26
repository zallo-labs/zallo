import { forwardRef, Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';
import { ActivationsWorker } from './activations.worker';
import { ACTIVATIONS_QUEUE } from './activations.queue';
import { registerBullQueue } from '../util/bull/bull.util';

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
