import { ERC20_INTERFACE } from '@token/token';
import { BigNumber, BigNumberish } from 'ethers';
import { Addresslike, Hex, asAddress, tryOrIgnore } from 'lib';

export const tryDecodeTransfer = (data: Hex | undefined) =>
  tryOrIgnore(() => {
    if (!data) return undefined;

    const [to, amount] = ERC20_INTERFACE.decodeFunctionData(
      ERC20_INTERFACE.functions['transfer(address,uint256)'],
      data,
    ) as [Addresslike, BigNumberish];

    return { to: asAddress(to), amount: BigNumber.from(amount).toBigInt() };
  });
