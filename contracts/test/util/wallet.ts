import * as hre from 'hardhat';
import * as zk from 'zksync-web3';
import { CONFIG } from '../../config';
import localWallets from '../../local-wallets.json';
import { Device } from 'lib';

export const provider = new zk.Provider(hre.config.zkSyncDeploy.zkSyncNetwork);

export const allSigners = localWallets.map(
  (w) => new Device(w.privateKey, provider),
);

export const device = new Device(CONFIG.walletPrivateKey, provider);
