import { BullModuleOptions } from '@nestjs/bull';
import { Hex } from 'lib';

export const TRANSACTIONS_QUEUE = {
  name: 'Transactions',
} satisfies BullModuleOptions;

export interface TransactionEvent {
  transaction: Hex;
}
