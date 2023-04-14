import { Native as Sentry } from 'sentry-expo';

export const captureException = (...params: Parameters<typeof Sentry.captureException>) => {
  console.warn('Sentry.captureException', ...params);
  return Sentry.captureException(...params);
};

export type SentryEvent = Parameters<typeof Sentry.captureEvent>[0];

export const captureEvent = (...params: Parameters<typeof Sentry.captureEvent>) => {
  console.log('Sentry.captureEvent', ...params);
  return Sentry.captureEvent(...params);
};

export const captureMessage = (...params: Parameters<typeof Sentry.captureMessage>) => {
  console.log('Sentry.captureMessage', ...params);
  return Sentry.captureMessage(...params);
};

export const { addBreadcrumb } = Sentry;
