import { Hex, asAddress, tryOrIgnore } from 'lib';
import { ERC20 } from 'lib/dapps';
import { decodeFunctionData } from 'viem';

export const tryDecodeTransfer = (data: Hex | undefined) =>
  tryOrIgnore(() => {
    if (!data) return undefined;

    const r = decodeFunctionData({ abi: ERC20, data });

    return r?.functionName === 'transfer'
      ? { to: asAddress(r.args[0]), amount: r.args[1] }
      : undefined;
  });
