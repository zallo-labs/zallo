import { Native as Sentry } from 'sentry-expo';
import crashlytics from '@react-native-firebase/crashlytics';
import _ from 'lodash';
import { match } from 'ts-pattern';

export type EventLevel = 'debug' | 'info' | 'warning' | 'error';

export interface EventParams {
  level: EventLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export const event = ({ level, message, context: contextParam, error }: EventParams) => {
  // Record the event in both sentry and crashlytics
  const context = contextParam
    ? _.mapValues(contextParam, (v) => JSON.stringify(v, null, 2))
    : undefined;

  crashlytics().log(`${level}: ${message}`);
  if (context) crashlytics().setAttributes(context);

  Sentry.captureMessage(message, { level, extra: context });

  if (error) {
    Sentry.captureException(error);
    crashlytics().recordError(error);
  }

  getConsoleLog(level)(`Event: ${message}`, {
    ...(context && { context }),
    ...(error && { error }),
  });
};

const getConsoleLog = (level: EventLevel) =>
  match(level)
    .with('debug', () => console.debug)
    .with('info', () => console.info)
    .with('warning', () => console.warn)
    .with('error', () => console.error)
    .exhaustive();
