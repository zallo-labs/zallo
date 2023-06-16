import * as zk from 'zksync-web3';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';
import { getEthersConnectionParams } from 'lib';

export const PROVIDER = new zk.Provider(...getEthersConnectionParams(CONFIG.chain, 'http'));

export const WALLET = new zk.Wallet(CONFIG.walletPrivateKey, PROVIDER);

export const WALLETS = localWallets.map((w) => new zk.Wallet(w.privateKey, PROVIDER));
