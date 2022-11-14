import { Module } from '@nestjs/common';
import { ContactsModule } from '../contacts/contacts.module';
import { DevicesResolver } from './devices.resolver';

@Module({
  imports: [ContactsModule],
  providers: [DevicesResolver],
})
export class DevicesModule {}
