import { Native as Sentry, init } from 'sentry-expo';
import { CONFIG } from '~/config';

export const SENTRY_ROUTING_INSTRUMENTATION =
  new Sentry.ReactNavigationInstrumentation();

export const withSentry = <P>(RootComponent: React.ComponentType<P>) => {
  init({
    dsn: CONFIG.sentry.dsn,
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

export const {
  Severity,
  addBreadcrumb,
  captureException,
  captureEvent,
  captureMessage,
} = Sentry;
