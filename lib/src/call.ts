import { Address } from './address';
import { Hex } from './bytes';

export interface Call {
  to: Address;
  value?: bigint;
  data?: Hex;
}
