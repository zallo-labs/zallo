import { BullModuleOptions } from '@nestjs/bull';
import { Chain } from 'chains';
import { Hex } from 'lib';

export const TRANSACTIONS_QUEUE = {
  name: 'Transactions',
} satisfies BullModuleOptions;

export interface TransactionEvent {
  chain: Chain;
  transaction: Hex;
}
