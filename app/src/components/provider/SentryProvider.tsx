import * as Sentry from '@sentry/react-native';
import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { CONFIG } from '~/util/config';
import * as Updates from 'expo-updates';

const manifest = Updates.manifest;
const metadata = 'metadata' in manifest ? manifest.metadata : undefined;
const extra = 'extra' in manifest ? manifest.extra : undefined;
const updateGroup = metadata && 'updateGroup' in metadata ? metadata.updateGroup : undefined;

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  enabled: !!CONFIG.sentryDsn,
  dsn: CONFIG.sentryDsn,
  environment: CONFIG.env,
  sampleRate: 1.0,
  tracesSampleRate: CONFIG.env === 'production' ? 0.2 : 1.0,
  _experiments: {
    profilesSampleRate: 1.0, // Relative to `tracesSampleRate`
  },
  attachStacktrace: true,
  integrations: [new Sentry.ReactNativeTracing({ routingInstrumentation })],
  tracePropagationTargets: [new URL(CONFIG.apiUrl).hostname], // FIXME: doesn't attach to GQL requests
});

Sentry.configureScope((scope) => {
  scope.setTag('expo-update-id', Updates.updateId);
  scope.setTag('expo-is-embedded-update', Updates.isEmbeddedLaunch);

  if (typeof updateGroup === 'string') {
    scope.setTag('expo-update-group-id', updateGroup);

    const owner = extra?.expoClient?.owner ?? '[account]';
    const slug = extra?.expoClient?.slug ?? '[project]';
    scope.setTag(
      'expo-update-debug-url',
      `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`,
    );
  }
});

export function SentryProvider() {
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    if (navRef) routingInstrumentation.registerNavigationContainer(navRef);
  }, [navRef]);

  return null;
}
