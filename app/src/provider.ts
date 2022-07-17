/*
 * CRITICAL: Import exactly in this order
 * https://docs.ethers.io/v5/cookbook/react-native/
 */
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { LogBox, Platform } from 'react-native';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/config';
import { Logger } from 'ethers/lib/utils';
import { captureEvent } from '@util/sentry/sentry';
import { LogLevel } from '@ethersproject/logger';
import { SeverityLevel } from '@sentry/browser';

// Ethers uses long timers; these tasks WON'T be executed when the app is in the background but will resume once re-opened
if (Platform.OS !== 'web') LogBox.ignoreLogs(['Setting a timer']);

export const CHAIN = CONFIG.chain;

export const PROVIDER = new zk.Provider(CHAIN.zksyncUrl);
// export const ETH_PROVIDER = ethers.getDefaultProvider(CHAIN.ethUrl);

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
logger._log = (logLevel: LogLevel, args: unknown[]) => {
  if (logLevel !== LogLevel.OFF)
    captureEvent({
      // level accepts Severity but it's deprecated, SeverityLevel is the replacement
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      level: ethersLevelToSentrySeverity(logLevel),
      message: args.join(' '),
    });

  return ogLog(logLevel, args);
};
