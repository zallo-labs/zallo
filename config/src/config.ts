import { ChainName, getChain } from './chain';

try {
  require('dotenv').config({ path: '../.env' });
} catch (e) {
  // fs or other such dependency is not available
}

const E = process?.env ?? {};

const apiPort = E.PORT || 3000;

const defaultChain: ChainName = 'testnet';
const chain = getChain(E.CHAIN?.toLowerCase() ?? defaultChain);

export const CONFIG = {
  env:
    E.RELEASE_ENV?.toLowerCase() === 'development' ? 'development' : 'production',
  chain,
  providers: {
    etherscan: E.ETHERSCAN_API_KEY,
  },
  coinmarketcapApiKey: E.COINMARKETCAP_API_KEY,
  wallet: {
    address: E.WALLET_ADDRESS,
    privateKey: E.WALLET_PRIVATE_KEY,
  },
  databaseUrl: E.DATABASE_URL,
  redisUrl: E.REDIS_URL,
  api: {
    port: apiPort,
  },
  sessionSecret: E.SESSION_SECRET,
  subgraphGqlUrl: E.SUBGRAPH_GQL_URL,
  accountImplAddress: E[`ACCOUNT_IMPL_${chain.name.toUpperCase()}`],
  proxyFactoryAddress: E[`PROXY_FACTORY_${chain.name.toUpperCase()}`],
  multicallAddress: E[`MULTI_CALL_${chain.name.toUpperCase()}`],
} as const;

export default CONFIG;

export type Config = typeof CONFIG;

export const IS_DEV = CONFIG.env === 'development';
export const IS_PROD = CONFIG.env === 'production';
