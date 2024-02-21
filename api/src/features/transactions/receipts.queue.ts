import { Chain } from 'chains';
import { Hex } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const ReceiptsQueue = createQueue<ReceiptEvent>('Transactions');
export type ReceiptsQueue = typeof ReceiptsQueue;

interface ReceiptEvent {
  chain: Chain;
  transaction: Hex | { child: number };
}
g