import * as Sentry from 'sentry-expo';
import { CONFIG } from '~/util/config';

Sentry.init({
  enabled: !__DEV__,
  dsn: CONFIG.sentryDsn,
  environment: CONFIG.env,
  enableInExpoDevelopment: false,
  sampleRate: 1.0, // Error sampling
  tracesSampleRate: 1.0, // Performance sampling
  attachStacktrace: true,
});
