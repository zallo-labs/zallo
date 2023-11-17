import {
  requiredEnv as required,
  optionalEnv as optional,
  getChain,
  setFallbackChain,
  Chain,
  asHex,
} from 'lib';
import localWallets from './local-wallets.json';
require('dotenv').config({ path: '../.env' });

const chain = getChain(optional`CHAIN` || ('zksync-local' satisfies Chain));
setFallbackChain(chain.key);

export const CONFIG = {
  env: optional`RELEASE_ENV` === 'development' ? 'development' : 'production',
  chain,
  walletPrivateKey: asHex(
    chain.key === 'zksync-local'
      ? localWallets[0]!.privateKey
      : (JSON.parse(required`WALLET_PRIVATE_KEYS` || '{}') as Record<Chain, string>)[chain.key],
  ),
  etherscanApiKey: optional`ETHERSCAN_API_KEY`,
  coinmarketcapApiKey: optional`COINMARKETCAP_API_KEY`,
};
