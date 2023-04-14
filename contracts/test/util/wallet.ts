import * as zk from 'zksync-web3';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';

export const PROVIDER = new zk.Provider(CONFIG.chain.rpc);

export const WALLET = new zk.Wallet(CONFIG.walletPrivateKey, PROVIDER);

export const WALLETS = localWallets.map((w) => new zk.Wallet(w.privateKey, PROVIDER));
