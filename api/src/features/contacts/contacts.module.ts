import { Module } from '@nestjs/common';
import { ContactsResolver } from './contacts.resolver';

@Module({
  providers: [ContactsResolver],
})
export class ContactsModule {}
