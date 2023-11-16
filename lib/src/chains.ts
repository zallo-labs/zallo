import * as viem from 'viem';
import * as viemChain from 'viem/chains';
import * as ethers from 'ethers';

interface ChainDefinition extends viem.Chain {
  key: string;
  layer1: viem.Chain;
  verifyUrl?: string;
}

export type Chain = keyof typeof CHAINS; // shortName https://eips.ethereum.org/EIPS/eip-3770
export type ChainConfig = (typeof CHAINS)[Chain];

export const CHAINS = {
  zksync: {
    ...viemChain.zkSync,
    key: 'zksync',
    name: 'zkSync',
    layer1: viemChain.mainnet,
    verifyUrl: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
    testnet: false,
  } as const,
  'zksync-goerli': {
    ...viemChain.zkSyncTestnet,
    key: 'zksync-goerli',
    name: 'zkSync Goerli testnet',
    layer1: viemChain.goerli,
    verifyUrl: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification',
  } as const,
  'zksync-local': {
    // https://github.com/matter-labs/era-test-node
    ...viemChain.zkSyncTestnet,
    key: 'zksync-local',
    name: 'zkSync Local testnet',
    id: 260,
    // id: 270,
    layer1: viemChain.localhost,
    verifyUrl: undefined,
    blockExplorers: undefined,
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
    // rpcUrls: {
    //   default: {
    //     http: ['http://localhost:3050'],
    //     webSocket: ['ws://localhost:3051'],
    //   },
    //   public: {
    //     http: ['http://localhost:3050'],
    //     webSocket: ['ws://localhost:3051'],
    //   },
    // },
  } as const,
} satisfies Record<string, ChainDefinition>;

export function getChain(
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

export const getEthersConnectionParams = (
  chain: ChainConfig,
  transport: 'http' | 'ws',
): [string, ethers.providers.Network] => [
  (transport === 'ws' && chain.rpcUrls.default.webSocket?.[0]) || chain.rpcUrls.default.http[0],
  {
    chainId: chain.id,
    name: chain.name,
    // ensAddress: chain.contracts?.ensUniversalResolver?.address,
  },
];

export type Network = viem.PublicClient<viem.Transport, ChainConfig>;
