import { Module } from '@nestjs/common';
import { ProviderModule } from '~/provider/provider.module';
import { SubmissionsResolver } from './submissions.resolver';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [ProviderModule],
  exports: [SubmissionsService],
  providers: [SubmissionsResolver, SubmissionsService]
})
export class SubmissionsModule {}
