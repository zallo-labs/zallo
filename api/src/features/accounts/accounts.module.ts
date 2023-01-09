import { Module } from '@nestjs/common';
import { FaucetModule } from '../faucet/faucet.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';

@Module({
  imports: [FaucetModule],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}
