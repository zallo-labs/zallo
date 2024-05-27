import { Chain } from 'chains';
import { Hex } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const ReceiptsQueue = createQueue<ReceiptEvent>('Receipts');
export type ReceiptsQueue = typeof ReceiptsQueue;

export type ReceiptEventType = 'transaction' | 'other';
interface ReceiptEvent {
  chain: Chain;
  transaction: Hex | { child: number };
  type: ReceiptEventType;
}
