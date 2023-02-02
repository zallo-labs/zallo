import { Module } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { ContactsResolver } from './contacts.resolver';

@Module({
  imports: [AccountsService],
  providers: [ContactsResolver],
})
export class ContactsModule {}
