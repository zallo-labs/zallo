import { Module } from '@nestjs/common';
import { AccountsResolver } from './accounts.resolver';

@Module({
  providers: [AccountsResolver],
})
export class AccountsModule {}
