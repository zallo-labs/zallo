import { getChain, makeRequiredEnv, optionalEnv as optional, tryAsAddress } from 'lib';
require('dotenv-vault-core').config({ path: '../.env' });

const required = makeRequiredEnv(!!process.env.JEST_WORKER_ID);

const chain = getChain(optional`CHAIN`);
const env = optional`RELEASE_ENV` === 'development' ? 'development' : 'production';

export const CONFIG = {
  env,
  debug: optional`DEBUG` === 'true' || (optional`DEBUG` === undefined && env === 'development'),
  apiPort: optional`API_PORT` || 3000,
  expoToken: required`EXPO_TOKEN`,
  databaseUrl: required`DATABASE_URL`,
  redisUrl: required`REDIS_URL`,
  sessionSecret: required`SESSION_SECRET`,
  graphRef: optional`APOLLO_GRAPH_REF`,
  chain,
  etherscanApiKey: required`ETHERSCAN_API_KEY`,
  subgraphGqlUrl: required`SUBGRAPH_GQL_URL`,
  walletPrivateKey: required`WALLET_PRIVATE_KEY`,
  accountImplAddress: tryAsAddress(required`ACCOUNT_IMPL_${chain.name.toUpperCase()}`),
  proxyFactoryAddress: tryAsAddress(required`PROXY_FACTORY_${chain.name.toUpperCase()}`),
};

export const IS_DEV = CONFIG.env === 'development';

export const __DEBUG__ = CONFIG.debug;
