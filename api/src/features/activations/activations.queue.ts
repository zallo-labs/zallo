import { UAddress, Hex } from 'lib';
import { createQueue } from '~/features/util/bull/bull.util';

export const ActivationsQueue = createQueue<ActivationEvent, Hex | null>('Activations');
export type ActivationsQueue = typeof ActivationsQueue;

export interface ActivationEvent {
  account: UAddress;
}
