import * as hre from 'hardhat';
import * as zk from 'zksync-web3';
import CONFIG from 'config';
import metanetWallets from '../../metanet-wallets.json';
import { providers } from 'ethers';

export const ethProvider: providers.BaseProvider =
  hre.ethers.getDefaultProvider(CONFIG.chain.ethUrl);

export const zkProvider = new zk.Provider(CONFIG.chain.zksyncUrl);

// export const zkProvider = zk.Provider.getDefaultProvider();

export const wallet = new zk.Wallet(
  CONFIG.wallet.privateKey!,
  zkProvider,
  // ethProvider,
);

export const allSigners = metanetWallets.map(
  (w) => new zk.Wallet(w.privateKey, zkProvider),
);

export const USDC = '0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4';
