import { Native as Sentry, init } from 'sentry-expo';
import { CONFIG } from '~/util/config';

export const SENTRY_ROUTING_INSTRUMENTATION = new Sentry.ReactNavigationInstrumentation();

export interface SentryProviderProps {
  children: React.ReactNode;
}

export const SentryProvider = ({ children }: SentryProviderProps) => {
  init({
    enabled: !__DEV__,
    dsn: CONFIG.sentryDsn,
    environment: CONFIG.env,
    enableInExpoDevelopment: false,
    sampleRate: 1.0, // Error sampling
    tracesSampleRate: 1.0, // Performance sampling
    attachStacktrace: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: SENTRY_ROUTING_INSTRUMENTATION,
      }),
    ],
  });

  return <>{children}</>;
};
