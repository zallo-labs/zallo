import { Module } from '@nestjs/common';
import { ReceiptsResolver } from './receipts.resolver';
import { ReceiptsService } from './receipts.service';

@Module({
  providers: [ReceiptsService, ReceiptsResolver],
})
export class ReceiptsModule {}
