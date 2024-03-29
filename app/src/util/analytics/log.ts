import * as Sentry from '@sentry/react-native';
import _ from 'lodash';

export type EventLevel = 'debug' | 'info' | 'warning' | 'error';

export interface LogEventOptions extends Record<string, unknown> {
  error?: Error | unknown;
}

export interface LogEventParams extends LogEventOptions {
  level: EventLevel;
  message: string;
}

export const logEvent = ({ level, message, error: ep, ...contextParam }: LogEventParams) => {
  // Record the event in both sentry and crashlytics
  const error = ep !== undefined ? (ep instanceof Error ? ep : new Error(`${ep}`)) : undefined;
  const context = _.mapValues(contextParam, (v) => JSON.stringify(v ?? null, null, 2));

  // Sentry
  if (error) {
    Sentry.captureException(error, { level, extra: { ...context, message } });
  } else {
    Sentry.captureMessage(message, { level, extra: context });
  }

  // Console
  CONSOLE[level](`Event: ${message}`, {
    ...(error && { error }),
    ...context,
  });
};

export const logDebug = (message: string, opts?: LogEventOptions) =>
  logEvent({ level: 'debug', message, ...opts });

export const logInfo = (message: string, opts?: LogEventOptions) =>
  logEvent({ level: 'info', message, ...opts });

export const logWarning = (message: string, opts?: LogEventOptions) =>
  logEvent({ level: 'warning', message, ...opts });

export const logError = (message: string, opts?: LogEventOptions) =>
  logEvent({ level: 'error', message, ...opts });

export const logTrace = (category: string, data: Record<string, any>) => {
  Sentry.addBreadcrumb({ level: 'debug', category, data });
  console.trace(category, data);
};

const CONSOLE: Record<EventLevel, typeof console.log> = {
  debug: console.debug,
  info: console.info,
  warning: console.warn,
  error: console.error,
};

export const setContext = (key: string, value: unknown) => {
  if (value !== undefined) {
    Sentry.setExtra(key, value);
    // crashlytics().setAttribute(key, JSON.stringify(value, null, 2));
  }
};
