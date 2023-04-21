import { Logger } from 'ethers/lib/utils';
import { LogLevel } from '@ethersproject/logger';
import { EventLevel, event } from '../analytics';
import BigIntJSON from '../BigIntJSON';

const toEventLevel = (level: LogLevel): EventLevel => {
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
  if (level !== LogLevel.OFF) {
    event({
      level: toEventLevel(level),
      message: BigIntJSON.stringify(args, null, 2),
    });
  }

  return ogLog(level, args);
};
