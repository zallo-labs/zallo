import { BigNumber, BytesLike } from 'ethers';
import { Address } from './addr';

export interface Call {
  to: Address;
  value?: BigNumber;
  data?: BytesLike;
}
