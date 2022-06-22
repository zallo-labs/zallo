import * as hre from 'hardhat';
import * as zk from 'zksync-web3';
import CONFIG from 'config';
import localWallets from '../../zksync-node/rich-wallets.json';
import { providers } from 'ethers';
import { address } from 'lib';

export const ethProvider: providers.BaseProvider =
  hre.ethers.getDefaultProvider(CONFIG.chain.ethUrl);

export const zkProvider = new zk.Provider(CONFIG.chain.zksyncUrl);

export const allSigners = localWallets.map(
  (w) => new zk.Wallet(w.privateKey, zkProvider),
);

export const wallet = CONFIG.wallet.privateKey
  ? new zk.Wallet(CONFIG.wallet.privateKey, zkProvider)
  : allSigners[0];

export const USDC = address('0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4');
