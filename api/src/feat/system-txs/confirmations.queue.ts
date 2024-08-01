import { Chain } from 'chains';
import { Hex } from 'lib';
import { createQueue } from '~/core/bull/bull.util';

export const ConfirmationQueue = createQueue<ConfirmationEvent>('Confirmation');
export type ConfirmationQueue = typeof ConfirmationQueue;

interface ConfirmationEvent {
  chain: Chain;
  transaction: Hex | { child: number };
}
