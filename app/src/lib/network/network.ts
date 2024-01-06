import { createPublicClient, http } from 'viem';

import { Chain, CHAINS, isChain, Network } from 'chains';
import { asChain, UAddress } from 'lib';

const networks: Partial<Record<Chain, Network>> = {};

export function getNetwork(param: Chain | UAddress): Network {
  const key = isChain(param) ? param : asChain(param);

  const chain = CHAINS[key];
  return (networks[key] ??= createPublicClient({ chain, name: chain.name, transport: http() }));
}
