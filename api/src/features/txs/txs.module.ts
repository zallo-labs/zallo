import { Module } from '@nestjs/common';
import { TxsResolver } from './txs.resolver';

@Module({
  providers: [TxsResolver]
})
export class TxsModule {}
