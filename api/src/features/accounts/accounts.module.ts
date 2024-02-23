import { forwardRef, Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';
import { UpgradeEvents } from '~/features/accounts/upgrades.events';
import { EventsModule } from '~/features/events/events.module';
import { SystemTxsModule } from '~/features/system-txs/system-txs.module';

@Module({
  imports: [
    ContractsModule,
    FaucetModule,
    forwardRef(() => PoliciesModule),
    EventsModule,
    SystemTxsModule,
  ],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService, UpgradeEvents],
})
export class AccountsModule {}
