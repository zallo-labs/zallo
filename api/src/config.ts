import { Hex, makeRequiredEnv, optionalEnv as optional } from 'lib';
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
  backgroundJobs: optional`BACKGROUND_JOBS` === 'false' ? false : true,
  expoToken: required`EXPO_TOKEN`,
  ensSuffix: required`ENS_SUFFIX`,
  redisUrl: required`REDIS_URL`,
  redisFamily: optional`REDIS_FAMILY` === '6' ? 6 : undefined,
  sessionSecret: required`SESSION_SECRET`,
  rpcUrls: JSON.parse(optional`RPC_URLS`?.replaceAll('\n', '') || '{}') as Record<Chain, string[]>,
  graphRef: optional`APOLLO_GRAPH_REF`,
  etherscanApiKey: required`ETHERSCAN_API_KEY`,
  walletPrivateKeys: JSON.parse(optional`WALLET_PRIVATE_KEYS` || '{}') as Record<Chain, Hex>,
  sentryDsn: optional`API_SENTRY_DSN`,
  serverId: optional`FLY_ALLOC_ID` || os.hostname(),
  bullBoardUser: optional`BULL_BOARD_USER`,
  bullBoardPassword: optional`BULL_BOARD_PASSWORD`,
  oauthClients: new Set<string>(
    [
      optional`GOOGLE_OAUTH_WEB_CLIENT`,
      optional`GOOGLE_OAUTH_IOS_CLIENT`,
      ...(JSON.parse(optional`APPLE_OAUTH_CLIENTS` || '[]') as string[]),
    ].filter(Boolean),
  ),
  pythHermesUrl: required`PYTH_HERMES_URL`,
  amplitudeKey: required`AMPLITUDE_KEY`,
} as const;
