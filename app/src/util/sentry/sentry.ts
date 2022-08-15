import { Native as Sentry, init } from 'sentry-expo';
import { CONFIG } from '~/config';

export const SENTRY_ROUTING_INSTRUMENTATION =
  new Sentry.ReactNavigationInstrumentation();

export const withSentry = <P>(RootComponent: React.ComponentType<P>) => {
  init({
    dsn: CONFIG.sentryDsn,
    environment: CONFIG.env,
    // enableInExpoDevelopment: true,
    // debug: true,
    sampleRate: 1, // Error sampling
    tracesSampleRate: 0.2, // Performance sampling
    attachStacktrace: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: SENTRY_ROUTING_INSTRUMENTATION,
      }),
    ],
  });

  return Sentry.wrap(RootComponent);
};

export const captureException = (
  ...params: Parameters<typeof Sentry.captureException>
) => {
  console.warn('Sentry.captureException', ...params);
  return Sentry.captureException(...params);
};

export const captureEvent = (
  ...params: Parameters<typeof Sentry.captureEvent>
) => {
  console.log('Sentry.captureEvent', ...params);
  return Sentry.captureEvent(...params);
};

export const captureMessage = (
  ...params: Parameters<typeof Sentry.captureMessage>
) => {
  console.log('Sentry.captureMessage', ...params);
  return Sentry.captureMessage(...params);
};

export const { addBreadcrumb } = Sentry;
