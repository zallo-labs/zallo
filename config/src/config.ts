import { ChainName, getChain } from './chain';

try {
  require('dotenv').config({ path: '../.env' });
} catch (e) {
  // fs or other such dependency is not available
}

const E = process?.env ?? {};

const apiPort = E.PORT || 3000;
const apiUrl = E.API_URL ?? `http://[::1]:${apiPort}`;

const defaultChain: ChainName = 'testnet';
const chain = getChain(E.CHAIN?.toLowerCase() ?? defaultChain);

const factoryAddresses: Partial<Record<ChainName, string>> = {
  testnet: '0x800f1a95d02e4E19931E4E93f92937f7ec813517',
};

export const CONFIG = {
  env:
    E.NODE_ENV?.toLowerCase() === 'development' ? 'development' : 'production',
  chain,
  providers: {
    infura: E.INFURA_ID,
    alchemy: E.ALCHEMY_API_KEY,
    etherscan: E.ETHERSCAN_API_KEY,
  },
  coinmarketcapApiKey: E.COINMARKETCAP_API_KEY,
  wallet: {
    address: E[`WALLET_ADDRESS_${chain.name.toUpperCase()}`],
    privateKey: E[`WALLET_PRIVATE_KEY_${chain.name.toUpperCase()}`],
  },
  databaseUrl: E.DATABASE_URL,
  api: {
    port: apiPort,
    url: apiUrl,
    gqlUrl: `${apiUrl}/graphql`,
  },
  sessionSecret: E.SESSION_SECRET,
  subgraphGqlUrl: E.SUBGRAPH_GQL_URL,
  factoryAddress: factoryAddresses[chain.name],
  sentry: {
    dsn: E.SENTRY_DSN,
    org: E.SENTRY_ORG,
    project: E.SENTRY_PROJECT,
    authToken: E.SENTRY_AUTH_TOKEN,
  },
  isDocker: E.IS_DOCKER?.toLowerCase() === 'true',
  useZksolcBin: E.USE_ZKSOLC_BIN?.toLowerCase() === 'true',
} as const;

export default CONFIG;

export type Config = typeof CONFIG;

export const IS_DEV = CONFIG.env === 'development';
export const IS_PROD = CONFIG.env === 'production';
