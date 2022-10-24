import { getChain, makeRequiredEnv, optionalEnv as optional } from 'lib';
require('dotenv').config({ path: '../.env' });

const required = makeRequiredEnv(process.env.RELEASE_ENV === 'test');

const chain = getChain(optional`CHAIN`);

export const CONFIG = {
  env: required`RELEASE_ENV` === 'development' ? 'development' : 'production',
  apiPort: optional`API_PORT` || 3000,
  expoToken: required`EXPO_TOKEN`,
  redisUrl: required`REDIS_URL`,
  sessionSecret: required`SESSION_SECRET`,
  chain,
  etherscanApiKey: required`ETHERSCAN_API_KEY`,
  subgraphGqlUrl: required`SUBGRAPH_GQL_URL`,
  walletPrivateKey: required`WALLET_PRIVATE_KEY`,
  proxyFactoryAddress: required`PROXY_FACTORY_${chain.name.toUpperCase()}`,
};

export const IS_DEV = CONFIG.env === 'development';
