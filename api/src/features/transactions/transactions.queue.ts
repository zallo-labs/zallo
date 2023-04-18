import { BullModuleOptions } from '@nestjs/bull';
import { Hex } from 'lib';

export const TRANSACTIONS_QUEUE = {
  name: 'Transactions',
  defaultJobOptions: {
    attempts: 15, // 2^15 * 200ms = ~1.8h
    backoff: { type: 'exponential', delay: 200 },
  },
} satisfies BullModuleOptions;

export interface TransactionEvent {
  transactionHash: Hex;
}
