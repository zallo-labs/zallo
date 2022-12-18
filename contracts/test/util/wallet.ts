import * as zk from 'zksync-web3';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';

export const PROVIDER = new zk.Provider(CONFIG.chain.zksyncUrl);

export const SIGNERS = localWallets.map((w) => new zk.Wallet(w.privateKey, PROVIDER));

export const WALLET = new zk.Wallet(CONFIG.walletPrivateKey, PROVIDER);
