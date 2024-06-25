import { forwardRef, Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';
import { UpgradeEvents } from '~/feat/accounts/upgrades.events';
import { EventsModule } from '~/feat/events/events.module';
import { SystemTxsModule } from '~/feat/system-txs/system-txs.module';
import { TransfersModule } from '../transfers/transfers.module';
import { ProposalsModule } from '~/feat/proposals/proposals.module';

@Module({
  imports: [
    ContractsModule,
    FaucetModule,
    forwardRef(() => PoliciesModule),
    EventsModule,
    SystemTxsModule,
    TransfersModule,
    ProposalsModule,
  ],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService, UpgradeEvents],
})
export class AccountsModule {}
