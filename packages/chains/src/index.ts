import * as viem_ from 'viem';
import * as viemChain from 'viem/chains';

export type Chain = keyof typeof CHAINS; // shortName https://eips.ethereum.org/EIPS/eip-3770
export type ChainConfig = (typeof CHAINS)[Chain];
export type Network = viem_.PublicClient<viem_.Transport, ChainConfig>;
export type NetworkWallet = viem_.WalletClient<viem_.Transport, ChainConfig, viem_.Account>;

export const CHAINS = {
  zksync: {
    ...viemChain.zksync,
    key: 'zksync', // EIP155 shortName
    name: 'zkSync Era',
    layer1: viemChain.mainnet,
    verifyUrl: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
    testnet: false,
  } as const,
  'zksync-sepolia': {
    ...viemChain.zksyncSepoliaTestnet,
    key: 'zksync-sepolia',
    name: 'zkSync Sepolia',
    layer1: viemChain.sepolia,
    verifyUrl: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
  } as const,
  'zksync-local': {
    ...viemChain.zksyncSepoliaTestnet,
    key: 'zksync-local',
    name: 'zkSync Local',
    /* era-test-node - https://github.com/matter-labs/era-test-node */
    id: 260,
    layer1: undefined,
    rpcUrls: {
      default: {
        http: ['http://localhost:8011'],
        webSocket: [] as string[],
      },
      public: {
        http: ['http://localhost:8011'],
        webSocket: [] as string[],
      },
    },
    verifyUrl: undefined,
    blockExplorers: undefined,
  } as const,
};

export function getChainConfig(
  key: Chain | string = 'zksync-local' satisfies Chain,
  supportedChains: Partial<typeof CHAINS> = CHAINS,
) {
  const chain = supportedChains[key as Chain];
  if (!chain) {
    throw new Error(
      `Unsupported chain: ${key}\nSupported chains: ${Object.keys(supportedChains).join(', ')}`,
    );
  }

  return chain;
}

export function isChain(k: unknown): k is Chain {
  return typeof k === 'string' && !!CHAINS[k as Chain];
}
