import { Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';
import { ContractsModule } from '../contracts/contracts.module';
import { PoliciesModule } from '../policies/policies.module';

@Module({
  imports: [ContractsModule, FaucetModule, PoliciesModule],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}
