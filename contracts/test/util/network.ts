import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';
import { asHex } from 'lib';
import { ChainConfig, Network, NetworkWallet } from 'chains';
import { HttpTransport, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import './matchers'; // Needs to be imported somewhere for all tests, but excluded from hardhat.config.ts imports

export const network: Network = createPublicClient<HttpTransport, ChainConfig>({
  chain: CONFIG.chain,
  transport: http(CONFIG.chain.rpcUrls.default.http[0]),
});

export const wallet: NetworkWallet = createWalletClient({
  chain: CONFIG.chain,
  transport: http(CONFIG.chain.rpcUrls.default.http[0]),
  account: privateKeyToAccount(asHex(CONFIG.walletPrivateKey)),
});

export const wallets = localWallets.map((w) => privateKeyToAccount(asHex(w.privateKey)));
