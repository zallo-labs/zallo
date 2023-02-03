import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { ContactsResolver } from './contacts.resolver';

@Module({
  imports: [AccountsModule],
  providers: [ContactsResolver],
})
export class ContactsModule {}
