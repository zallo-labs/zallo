import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';
import { asHex } from 'lib';
import { ChainConfig, Network, NetworkWallet } from 'chains';
import {
  HttpTransport,
  TestClient,
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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
