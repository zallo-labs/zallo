import { Hex, UAddress } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const ACTIVATIONS_QUEUE = createQueue<ActivationEvent>('Activations');

interface ActivationEvent {
  account: UAddress;
  transaction: Hex;
}
