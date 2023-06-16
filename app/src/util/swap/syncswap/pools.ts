import { Address, ZERO_ADDR, asAddress, compareAddress, isPresent } from 'lib';
import { Pool } from '../types';
import { VIEM_CLIENT } from '@network/provider';
import { SYNCSWAP_CLASSIC_POOL_FACTORY, SYNCSWAP_STABLE_POOL_FACTORY } from './contracts';
import { normalizeSyncswapPoolToken } from './util';

export async function getPools(tokensParam: Address[]): Promise<Pool[]> {
  const tokens = [...tokensParam].sort(compareAddress);

  const poolCalls = tokens.flatMap((fromToken, i) => {
    const toTokens = tokens.slice(i + 1);

    return toTokens.flatMap((toToken) => {
      const pair: [Address, Address] = [fromToken, toToken];

      const args = pair.map(normalizeSyncswapPoolToken) as [Address, Address];

      return [
        {
          pair,
          type: 'syncswap-classic' as const,
          call: {
            abi: SYNCSWAP_CLASSIC_POOL_FACTORY.abi,
            address: SYNCSWAP_CLASSIC_POOL_FACTORY.address,
            functionName: 'getPool',
            args,
          },
        },
        {
          pair,
          type: 'syncswap-stable' as const,
          call: {
            abi: SYNCSWAP_STABLE_POOL_FACTORY.abi,
            address: SYNCSWAP_STABLE_POOL_FACTORY.address,
            functionName: 'getPool',
            args,
          },
        },
      ] as const;
    });
  });

  const responses = await VIEM_CLIENT.multicall({
    contracts: poolCalls.map((call) => call.call),
  });

  return poolCalls
    .map(({ pair, type }, i): Pool | undefined => {
      const r = responses[i];

      return r?.status === 'success' && r.result !== ZERO_ADDR
        ? { contract: asAddress(r.result), pair, type }
        : undefined;
    })
    .filter(isPresent);
}
