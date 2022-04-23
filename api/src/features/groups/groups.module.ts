import { Module } from '@nestjs/common';
import { GroupsResolver } from './groups.resolver';

@Module({
  providers: [GroupsResolver]
})
export class GroupsModule {}
