import { requiredEnv as required, optionalEnv as optional, getChain, setFallbackChain } from 'lib';
import localWallets from './local-wallets.json';
require('dotenv').config({ path: '../.env' });

const chain = getChain(optional`CHAIN` || 'local');

export const CONFIG = {
  env: optional`RELEASE_ENV` === 'development' ? 'development' : 'production',
  chain: getChain(optional`CHAIN`),
  walletPrivateKey:
    chain.key === 'local' ? localWallets[0]!.privateKey : required`WALLET_PRIVATE_KEY`,
  etherscanApiKey: optional`ETHERSCAN_API_KEY`,
  coinmarketcapApiKey: optional`COINMARKETCAP_API_KEY`,
};
setFallbackChain(CONFIG.chain);
