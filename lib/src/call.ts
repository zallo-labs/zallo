import { BigNumber, BytesLike, BigNumberish } from 'ethers';
import { hexlify } from 'ethers/lib/utils';
import { Address, address, ZERO_ADDR } from './addr';
import { ZERO } from './bignum';

export interface Call {
  to: Address;
  value: BigNumber;
  data: BytesLike;
}

export interface CallDef {
  to?: Address | string;
  value?: BigNumberish;
  data?: BytesLike;
}

export const toCall = (c: CallDef): Call => ({
  to: (c.to && address(c.to)) || ZERO_ADDR,
  value: c.value !== undefined ? BigNumber.from(c.value) : ZERO,
  data: c.data ? hexlify(c.data) : '0x',
});
