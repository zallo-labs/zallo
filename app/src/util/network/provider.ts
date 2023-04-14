/*
 * CRITICAL: Import exactly in this order
 * https://docs.ethers.io/v5/cookbook/react-native/
 */
import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'ethers';

import { LogBox, Platform } from 'react-native';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/util/config';
import { Logger } from 'ethers/lib/utils';
import { captureEvent } from '~/util/sentry';
import { LogLevel } from '@ethersproject/logger';
import { SeverityLevel } from '@sentry/browser';
import { CHAINS, getChain } from 'lib';
import _ from 'lodash';
import BigIntJSON from '../BigIntJSON';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const SUPPORTED_CHAINS =
  CONFIG.env === 'development' ? CHAINS : _.omit(CHAINS, ['local'] /* satisfies ChainName[] */);

export const CHAIN = getChain(CONFIG.chainName, SUPPORTED_CHAINS);
export const PROVIDER = new zk.Provider(CHAIN.rpc);
export const CHAIN_ID = () => PROVIDER?.network?.chainId ?? CHAINS.testnet.id;

const ethersLevelToSentrySeverity = (level: LogLevel): SeverityLevel => {
  switch (level) {
    case LogLevel.OFF:
    case LogLevel.INFO:
      return 'info';
    case LogLevel.DEBUG:
      return 'debug';
    case LogLevel.WARNING:
      return 'warning';
    case LogLevel.ERROR:
      return 'error';
  }
};

const logger = Logger.globalLogger();
const ogLog = logger._log;
logger._log = (level: LogLevel, args: unknown[]) => {
  if (level !== LogLevel.OFF)
    captureEvent({
      level: ethersLevelToSentrySeverity(level),
      message: BigIntJSON.stringify(args, null, 2),
    });

  return ogLog(level, args);
};
