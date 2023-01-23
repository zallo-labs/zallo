import { Module } from '@nestjs/common';
import { ContactsModule } from '../contacts/contacts.module';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [ContactsModule],
  providers: [UsersResolver],
})
export class UsersModule {}
