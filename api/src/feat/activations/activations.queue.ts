import { UAddress, Hex, UUID } from 'lib';
import { createQueue } from '~/core/bull/bull.util';

export const ActivationsQueue = createQueue<ActivationEvent, Hex | string | null>('Activations');
export type ActivationsQueue = typeof ActivationsQueue;

export interface ActivationEvent {
  account: UAddress;
  sponsoringTransaction: UUID;
}
