import { BullModuleOptions } from '@nestjs/bull';
import { Chain, Hex } from 'lib';

export const TRANSACTIONS_QUEUE = {
  name: 'Transactions',
} satisfies BullModuleOptions;

export interface TransactionEvent {
  chain: Chain;
  transaction: Hex;
}
