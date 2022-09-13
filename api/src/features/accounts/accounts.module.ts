import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AccountsResolver } from './accounts.resolver';
import { AccountsService } from './accounts.service';

@Module({
  imports: [UsersModule],
  exports: [AccountsService],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}
