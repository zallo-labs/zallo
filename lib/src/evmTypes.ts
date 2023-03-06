import { BigNumber, BigNumberish } from 'ethers';
import { A } from 'ts-toolbelt';

export const asBoundedBn =
  <T extends BigNumberish>(min: T, max: T) =>
  (v: BigNumberish) => {
    const n = BigNumber.from(v);
    if (n.lt(min)) throw new Error(`${n} is less than minimum ${MIN_UINT256}`);
    if (n.gt(max)) throw new Error(`${n} is greater than maximum ${MAX_UINT256}`);

    return n as T;
  };

export type Uint256 = A.Type<BigNumber, 'Uint256'>;
export const MIN_UINT256 = BigNumber.from(0n) as Uint256;
export const MAX_UINT256 = BigNumber.from(2n ** 256n - 1n) as Uint256;
export const asUint256 = asBoundedBn<Uint256>(MIN_UINT256, MAX_UINT256);

export type Uint8 = A.Type<BigNumber, 'Uint8'>;
export const MIN_UINT8 = MIN_UINT256 as unknown as Uint8;
export const MAX_UINT8 = BigNumber.from(2n ** 8n - 1n) as Uint8;
export const asUint8 = asBoundedBn<Uint8>(MIN_UINT8, MAX_UINT8);
