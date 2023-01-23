export type ChainName = 'local' | 'testnet' | 'mainnet';

export interface Chain {
  name: ChainName;
  id: number;
  l2Rpc: string;
  l1Rpc: string;
  isTestnet: boolean;
}

// https://v2-docs.zksync.io/dev/troubleshooting/important-links.html
export const CHAINS = {
  local: {
    name: 'local',
    id: 0,
    l2Rpc: 'http://localhost:3050',
    l1Rpc: 'http://localhost:8545',
    isTestnet: true,
  } as const,
  testnet: {
    name: 'testnet',
    id: 280,
    l2Rpc: 'https://zksync2-testnet.zksync.dev',
    l1Rpc: 'goerli',
    isTestnet: true,
  } as const,
  mainnet: {
    name: 'mainnet',
    id: 324,
    l2Rpc: 'https://zksync2-mainnet.zksync.io',
    l1Rpc: 'mainnet',
    isTestnet: false,
  },
} satisfies Record<ChainName, Chain>;

export type Chains = typeof CHAINS;

export const getChain = (name: ChainName | string = 'testnet') => {
  const chain = CHAINS[name.toLowerCase() as ChainName];
  if (!chain)
    throw new Error(`Unknown chain: ${name}\nSupported chains: ${Object.keys(CHAINS).join(', ')}`);

  return chain;
};
