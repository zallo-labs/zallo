import * as viem from 'viem';
import * as viemChain from 'viem/chains';
import * as ethers from 'ethers';

export type ChainKey = 'mainnet' | 'testnet' | 'local';
export interface Chain extends viem.Chain {
  key: ChainKey;
}

export type Chains = typeof CHAINS;

// https://v2-docs.zksync.io/dev/troubleshooting/important-links.html
export const CHAINS: Record<ChainKey, Chain> = {
  mainnet: {
    key: 'mainnet',
    ...viemChain.zkSync,
    name: 'zkSync',
  },
  testnet: {
    key: 'testnet',
    ...viemChain.zkSyncTestnet,
    name: 'zkSync testnet',
  },
  local: {
    key: 'local',
    id: 280,
    name: 'zkSync local testnet',
    network: 'zksync-local-testnet',
    nativeCurrency: viemChain.zkSyncTestnet.nativeCurrency,
    rpcUrls: {
      default: {
        http: ['http://localhost:3050'],
        webSocket: ['ws://localhost:3051'],
      },
      public: {
        http: ['http://localhost:3050'],
        webSocket: ['ws://localhost:3051'],
      },
    },
    testnet: true,
  },
};

export const getChain = (
  key: ChainKey | string = 'testnet' satisfies ChainKey,
  supportedChains: Partial<Chains> = CHAINS,
) => {
  const chain = supportedChains[key.toLowerCase() as ChainKey];
  if (!chain) {
    throw new Error(
      `Unsupported chain: ${key}\nSupported chains: ${Object.keys(supportedChains).join(', ')}`,
    );
  }

  return chain;
};

export const getEthersConnectionParams = (
  chain: Chain,
  transport: 'http' | 'ws',
): [string, ethers.providers.Network] => [
  (transport === 'ws' && chain.rpcUrls.default.webSocket?.[0]) || chain.rpcUrls.default.http[0],
  {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensUniversalResolver?.address,
  },
];
