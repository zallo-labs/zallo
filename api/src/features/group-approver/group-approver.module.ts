import { Module } from '@nestjs/common';
import { GroupApproverResolver } from './group-approver.resolver';

@Module({
  providers: [GroupApproverResolver]
})
export class GroupApproverModule {}
