import { BytesLike } from 'ethers';
import { Address } from './addr';

export interface Call {
  to: Address;
  value?: bigint;
  data?: BytesLike;
}
