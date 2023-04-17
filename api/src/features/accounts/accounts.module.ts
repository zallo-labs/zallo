import { Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';
import { ExplorerModule } from '../explorer/explorer.module';

@Module({
  imports: [ContractsModule, FaucetModule, PoliciesModule, ExplorerModule],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}
