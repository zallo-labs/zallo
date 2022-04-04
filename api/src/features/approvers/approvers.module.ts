import { Module } from '@nestjs/common';
import { ApproversResolver } from './approvers.resolver';

@Module({
  providers: [ApproversResolver],
})
export class ApproversModule {}
