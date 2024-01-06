import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
  HttpTransport,
  TestClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { ChainConfig, Network, NetworkWallet } from 'chains';
import { asHex } from 'lib';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';

import './matchers'; // Needs to be imported somewhere for all tests, but excluded from hardhat.config.ts imports

const config = {
  chain: CONFIG.chain,
  transport: http(CONFIG.chain.rpcUrls.default.http[0]),
};

export const network: Network = createPublicClient<HttpTransport, ChainConfig>(config);

export const testNetwork: TestClient<'hardhat', HttpTransport, ChainConfig> = createTestClient<
  'hardhat',
  HttpTransport,
  ChainConfig
>({
  mode: 'hardhat',
  ...config,
});

export const wallet: NetworkWallet = createWalletClient({
  account: privateKeyToAccount(asHex(CONFIG.walletPrivateKey)),
  ...config,
});

export const wallets = localWallets.map((w) => privateKeyToAccount(asHex(w.privateKey)));
