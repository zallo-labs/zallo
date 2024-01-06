import { Module } from '@nestjs/common';

import { ApproversResolver } from './approvers.resolver';
import { ApproversService } from './approvers.service';

@Module({
  providers: [ApproversService, ApproversResolver],
})
export class ApproversModule {}
