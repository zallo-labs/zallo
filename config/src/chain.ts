export type ChainName = 'metanet' | 'testnet' | 'local';

export interface Chain {
  name: ChainName;
  zksyncUrl: string;
  ethUrl: string;
}

export type Chains = Record<ChainName, Chain>;

export const CHAINS: Chains = {
  metanet: {
    name: 'metanet',
    zksyncUrl: 'http://metanet.metasafe.fi:3050',
    ethUrl: 'http://metanet.metasafe.fi:8545',
  },
  testnet: {
    name: 'testnet',
    zksyncUrl: 'https://zksync2-testnet.zksync.dev',
    ethUrl: 'goerli',
  },
  local: {
    name: 'local',
    zksyncUrl: 'http://localhost:3050',
    ethUrl: 'http://localhost:8545',
  },
};

export const getChain = (name: string) => {
  const chain = Object.values(CHAINS).find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
  if (!chain) throw new Error(`Chain not supported: ${name}`);

  return chain;
};
