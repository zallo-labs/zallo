import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';

@Module({
  exports: [BalancesService],
  providers: [BalancesService],
})
export class BalancesModule {}
