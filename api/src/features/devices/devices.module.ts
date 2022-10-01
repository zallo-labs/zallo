import { Module } from '@nestjs/common';
import { DevicesResolver } from './devices.resolver';

@Module({
  providers: [DevicesResolver],
})
export class DevicesModule {}
