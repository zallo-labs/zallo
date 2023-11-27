import { Chain, getChain } from 'chains';
import localWallets from './local-wallets.json';
require('dotenv').config({ path: '../.env' });

const chain = getChain(process.env.CHAIN || ('zksync-local' satisfies Chain));

export const CONFIG = {
  env: process.env.RELEASE_ENV === 'development' ? 'development' : 'production',
  chain,
  walletPrivateKey:
    chain.key === 'zksync-local'
      ? localWallets[0]!.privateKey
      : (JSON.parse(process.env.WALLET_PRIVATE_KEYS || '{}') as Record<Chain, string>)[chain.key],
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  coinmarketcapApiKey: process.env.COINMARKETCAP_API_KEY,
};
