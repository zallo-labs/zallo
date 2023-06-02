import { Module } from '@nestjs/common';
import { PaymasterService } from './paymaster.service';
import { PaymasterResolver } from './paymaster.resolver';

@Module({
  providers: [PaymasterService, PaymasterResolver],
  exports: [PaymasterService],
})
export class PaymasterModule {}
