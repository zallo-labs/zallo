import {
  requiredEnv as required,
  optionalEnv as optional,
  getChain,
} from 'lib';
import localWallets from './local-wallets.json';

const chain = getChain(optional`CHAIN`);
export const CONFIG = {
  env:
    optional`RELEASE_ENV`?.toLowerCase() === 'development'
      ? 'development'
      : 'production',
  chain: getChain(optional`CHAIN`),
  walletPrivateKey:
    chain.name === 'local'
      ? localWallets[0].privateKey
      : required`WALLET_PRIVATE_KEY`,
  etherscanApiKey: optional`ETHERSCAN_API_KEY`,
  coinmarketcapApiKey: optional`COINMARKETCAP_API_KEY`,
};
