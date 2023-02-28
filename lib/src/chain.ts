export type ChainName = 'local' | 'testnet' | 'mainnet';

export interface Chain {
  name: ChainName;
  id: number;
  isTestnet: boolean;
  rpc: string;
  ws: string | undefined;
  l1Rpc: string;
  explorer: string | undefined;
}

// https://v2-docs.zksync.io/dev/troubleshooting/important-links.html
export const CHAINS = {
  local: {
    name: 'local',
    id: 270,
    isTestnet: true,
    rpc: 'http://localhost:3050',
    ws: 'ws://localhost:3051',
    l1Rpc: 'http://localhost:8545',
    explorer: undefined,
  } as const,
  testnet: {
    name: 'testnet',
    id: 280,
    isTestnet: true,
    rpc: 'https://zksync2-testnet.zksync.dev',
    ws: 'wss://zksync2-testnet.zksync.dev/ws',
    l1Rpc: 'goerli',
    explorer: 'https://goerli.explorer.zksync.io',
  } as const,
  mainnet: {
    name: 'mainnet',
    id: 324,
    isTestnet: false,
    rpc: 'https://zksync2-mainnet.zksync.io',
    ws: 'wss://zksync2-mainnet.zksync.io/ws',
    l1Rpc: 'mainnet',
    explorer: 'https://explorer.zksync.io',
  },
} satisfies Record<ChainName, Chain>;

export type Chains = typeof CHAINS;

export const getChain = (name: ChainName | string = 'testnet') => {
  const chain = CHAINS[name.toLowerCase() as ChainName];
  if (!chain)
    throw new Error(`Unknown chain: ${name}\nSupported chains: ${Object.keys(CHAINS).join(', ')}`);

  return chain;
};
