import { Module } from '@nestjs/common';
import { ContactsResolver } from './contacts.resolver';
import { ContactsService } from './contacts.service';

@Module({
  providers: [ContactsResolver, ContactsService],
})
export class ContactsModule {}
