import { Module } from '@nestjs/common';
import { ApproversService } from './approvers.service';
import { ApproversResolver } from './approvers.resolver';

@Module({
  providers: [ApproversService, ApproversResolver],
})
export class ApproversModule {}
