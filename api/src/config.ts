import { Hex, isPresent, makeRequiredEnv, optionalEnv as optional } from 'lib';
import { Chain } from 'chains';
import os from 'os';
require('dotenv').config({ path: '../.env' });

const required = makeRequiredEnv(!!process.env.JEST_WORKER_ID);

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
  ensSuffix: required`ENS_SUFFIX`,
  redisUrl: required`REDIS_URL`,
  redisFamily: optional`REDIS_FAMILY` === '6' ? 6 : undefined,
  sessionSecret: required`SESSION_SECRET`,
  graphRef: optional`APOLLO_GRAPH_REF`,
  etherscanApiKey: required`ETHERSCAN_API_KEY`,
  walletPrivateKeys: JSON.parse(optional`WALLET_PRIVATE_KEYS` || '{}') as Record<Chain, Hex>,
  uniswapGqlUrl: required`UNISWAP_GQL_URL`,
  sentryDsn: optional`API_SENTRY_DSN`,
  serverId: optional`FLY_ALLOC_ID` || os.hostname(),
  bullBoardUser: optional`BULL_BOARD_USER`,
  bullBoardPassword: optional`BULL_BOARD_PASSWORD`,
  oauthClients: new Set<string>(
    [
      optional`GOOGLE_OAUTH_WEB_CLIENT`,
      optional`GOOGLE_OAUTH_IOS_CLIENT`,
      ...(JSON.parse(optional`APPLE_OAUTH_CLIENTS` || '[]') as string[]),
    ].filter(isPresent),
  ),
  pythHermesUrl: required`PYTH_HERMES_URL`,
} as const;
