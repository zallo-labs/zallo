import * as zk from 'zksync-web3';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';
import { ChainConfig, getEthersConnectionParams } from 'lib';
import { createPublicClient, http } from 'viem';
import { HttpTransport } from 'viem';

export const PROVIDER = new zk.Provider(...getEthersConnectionParams(CONFIG.chain, 'http'));
export const network = createPublicClient<HttpTransport, ChainConfig>({
  chain: CONFIG.chain,
  transport: http(),
  batch: { multicall: false },
});

export const WALLET = new zk.Wallet(CONFIG.walletPrivateKey, PROVIDER);

export const WALLETS = localWallets.map((w) => new zk.Wallet(w.privateKey, PROVIDER));
