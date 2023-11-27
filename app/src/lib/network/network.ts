import { CHAINS, Chain, Network, isChain } from 'chains';
import { UAddress, asChain } from 'lib';
import { createPublicClient, http } from 'viem';

const networks: Partial<Record<Chain, Network>> = {};

export function getNetwork(param: Chain | UAddress): Network {
  const key = isChain(param) ? param : asChain(param);

  const chain = CHAINS[key];
  return (networks[key] ??= createPublicClient({ chain, name: chain.name, transport: http() }));
}
