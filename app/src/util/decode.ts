import { ERC20_ABI, Hex, asAddress, tryOrIgnore } from 'lib';
import { decodeFunctionData } from 'viem';

export const tryDecodeTransfer = (data: Hex | undefined) =>
  tryOrIgnore(() => {
    if (!data) return undefined;

    const r = decodeFunctionData({ abi: ERC20_ABI, data });

    return r?.functionName === 'transfer'
      ? { to: asAddress(r.args[0]), amount: r.args[1] }
      : undefined;
  });
