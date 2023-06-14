import * as viem from 'viem';
import * as viemChain from 'viem/chains';

export type ChainName = 'mainnet' | 'testnet';

export interface Chain {
  name: ChainName;
  friendlyName: string;
  id: number;
  isTestnet: boolean;
  rpc: string;
  ws: string;
  l1Rpc: string;
  explorer: string | undefined;
  viem: viem.Chain;
}

// https://v2-docs.zksync.io/dev/troubleshooting/important-links.html
export const CHAINS = {
  mainnet: {
    name: 'mainnet',
    friendlyName: 'zkSync',
    id: 324,
    isTestnet: false,
    rpc: 'https://mainnet.era.zksync.io',
    ws: 'wss://mainnet.era.zksync.io/ws',
    l1Rpc: 'mainnet',
    explorer: 'https://explorer.zksync.io',
    viem: viemChain.zkSync,
  },
  testnet: {
    name: 'testnet',
    friendlyName: 'zkSync testnet',
    id: 280,
    isTestnet: true,
    rpc: 'https://testnet.era.zksync.dev',
    ws: 'wss://testnet.era.zksync.dev/ws',
    l1Rpc: 'goerli',
    explorer: 'https://goerli.explorer.zksync.io',
    viem: viemChain.zkSyncTestnet,
  } as const,
} satisfies Record<ChainName, Chain>;

export type Chains = typeof CHAINS;

export const getChain = (
  name: ChainName | string = CHAINS.testnet.name,
  supportedChains: Partial<Record<ChainName, Chain>> = CHAINS,
) => {
  const chain = supportedChains[name.toLowerCase() as ChainName];
  if (!chain) {
    throw new Error(
      `Unsupported chain: ${name}\nSupported chains: ${Object.keys(supportedChains).join(', ')}`,
    );
  }

  return chain;
};
