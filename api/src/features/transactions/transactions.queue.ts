import { Chain } from 'chains';
import { Hex } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const TransactionsQueue = createQueue<TransactionEvent>('Transactions');
export type TransactionsQueue = typeof TransactionsQueue;

interface TransactionEvent {
  chain: Chain;
  transaction: Hex | 'child';
}
