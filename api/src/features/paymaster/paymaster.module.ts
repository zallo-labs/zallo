import { Module } from '@nestjs/common';
import { PaymasterService } from './paymaster.service';
import { PaymasterResolver } from './paymaster.resolver';

@Module({
  exports: [PaymasterService],
  providers: [PaymasterService, PaymasterResolver],
})
export class PaymasterModule {}
