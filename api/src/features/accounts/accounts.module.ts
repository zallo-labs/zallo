import { Module } from '@nestjs/common';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';

@Module({
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}
