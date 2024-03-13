import { Address, ETH_ADDRESS } from 'lib';
import { Chain } from 'chains';
import { SYNCSWAP, WETH } from 'lib/dapps';
import { atomFamily } from 'jotai/utils';
import { getNetwork } from '@network/network';
import { atom } from 'jotai';

export interface SyncswapPool {
  address: Address;
  pair: [Address, Address];
}

export const SYNCSWAP_POOL_FAMILY = atomFamily((chain: Chain) => atom(getSyncswapPools(chain)));

async function getSyncswapPools(chain: Chain): Promise<SyncswapPool[]> {
  const network = getNetwork(chain);
  const poolMaster = SYNCSWAP.poolMaster.address[network.chain.key];
  if (!poolMaster) return [];

  const poolsLen = await network.readContract({
    address: poolMaster,
    abi: SYNCSWAP.poolMaster.abi,
    functionName: 'poolsLength',
  });

  const pools = (
    await network.multicall({
      contracts: Array(Number(poolsLen))
        .fill(0)
        .map(
          (_, i) =>
            ({
              address: poolMaster,
              abi: SYNCSWAP.poolMaster.abi,
              functionName: 'pools',
              args: [BigInt(i)],
            }) as const,
        ),
    })
  )
    .map((p) => p.result)
    .filter(Boolean);

  const poolPairs = await network.multicall({
    contracts: pools.map(
      (address) =>
        ({
          address,
          abi: SYNCSWAP.poolAbi,
          functionName: 'getAssets',
        }) as const,
    ),
  });

  const wETH = WETH.address[chain];
  return pools
    .flatMap((address, i): SyncswapPool[] => {
      const pair = poolPairs[i].result;
      if (!pair || pair.length !== 2) return [];

      const r: SyncswapPool = {
        address,
        pair: [pair[0], pair[1]],
      };

      if (pair.includes(wETH)) {
        // Include a dummy ETH pair pool
        return [
          r,
          {
            address,
            pair: [ETH_ADDRESS, pair[0] === wETH ? pair[1] : pair[0]],
          },
        ];
      } else {
        return [r];
      }
    })
    .filter(Boolean);
}
