import { getChain, makeRequiredEnv, optionalEnv as optional, tryAsAddress } from 'lib';
import os from 'os';
require('dotenv').config({ path: '../.env' });

const required = makeRequiredEnv(!!process.env.JEST_WORKER_ID);

const chain = getChain(optional`CHAIN`);
const env = optional`RELEASE_ENV` === 'development' ? 'development' : 'production';

export enum LogLevel {
  Verbose = 'verbose',
  Debug = 'debug',
  Log = 'log',
  Warn = 'warn',
  Error = 'error',
}

export const CONFIG = {
  env,
  debug: optional`DEBUG` === 'true' || (optional`DEBUG` === undefined && env === 'development'),
  logLevel: Object.values(LogLevel).find((l) => l === optional`LOG_LEVEL`) ?? LogLevel.Debug,
  apiPort: optional`API_PORT` || 3000,
  expoToken: required`EXPO_TOKEN`,
  redisUrl: required`REDIS_URL`,
  redisFamily: optional`REDIS_FAMILY` === '6' ? 6 : undefined,
  sessionSecret: required`SESSION_SECRET`,
  graphRef: optional`APOLLO_GRAPH_REF`,
  chain,
  etherscanApiKey: required`ETHERSCAN_API_KEY`,
  walletPrivateKey: required`WALLET_PRIVATE_KEY`,
  accountImplAddress: tryAsAddress(required`ACCOUNT_IMPL_${chain.key.toUpperCase()}`),
  proxyFactoryAddress: tryAsAddress(required`PROXY_FACTORY_${chain.key.toUpperCase()}`),
  sentryDsn: required`API_SENTRY_DSN`,
  serverId: optional`FLY_ALLOC_ID` || os.hostname(),
  bullBoardUser: optional`BULL_BOARD_USER`,
  bullBoardPassword: optional`BULL_BOARD_PASSWORD`,
} as const;
