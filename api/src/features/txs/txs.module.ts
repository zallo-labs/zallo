import { Module } from '@nestjs/common';
import { SubmissionsModule } from '../submissions/submissions.module';
import { TxsResolver } from './txs.resolver';

@Module({
  imports: [SubmissionsModule],
  providers: [TxsResolver],
})
export class TxsModule {}
