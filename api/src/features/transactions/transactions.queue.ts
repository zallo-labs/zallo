import { Chain } from 'chains';
import { Hex } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const TRANSACTIONS_QUEUE = createQueue<TransactionEvent>('Transactions');

interface TransactionEvent {
  chain: Chain;
  transaction: Hex;
}
