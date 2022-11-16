export type ChainName = 'testnet' | 'local';

export interface Chain {
  name: ChainName;
  zksyncUrl: string;
  ethUrl: string;
  isTestnet: boolean;
}

export type Chains = Record<ChainName, Chain>;

export const CHAINS: Chains = {
  testnet: {
    name: 'testnet',
    zksyncUrl: 'https://zksync2-testnet.zksync.dev',
    ethUrl: 'goerli',
    isTestnet: true,
  },
  local: {
    name: 'local',
    zksyncUrl: 'http://localhost:3050',
    ethUrl: 'http://localhost:8545',
    isTestnet: true,
  },
};

export const getChain = (name: ChainName | string = 'testnet') => {
  name = name.toLowerCase();
  const chain = Object.values(CHAINS).find((c) => c.name.toLowerCase() === name);
  if (!chain) throw new Error(`Chain not supported: ${name}`);

  return chain;
};
