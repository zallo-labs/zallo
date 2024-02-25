import { GoogleOAuthProvider } from '@react-oauth/google';
import { PropsWithChildren } from 'react';
import { CONFIG } from '~/util/config';

export function GoogleAuthProvider({ children }: PropsWithChildren) {
  // Required by @react-native-google-signin/google-signin
  // @ts-expect-error google sdk is not typed
  const isInitialized = typeof window.__G_ID_CLIENT__ !== 'undefined';
  if (!isInitialized && 'google' in window) {
    window.google.accounts.id.initialize({
      client_id: CONFIG.googleOAuth.webClient,
      auto_select: false,
      log_level: 'debug',
    });
  }

  // Required by @react-oauth/google
  return (
    <GoogleOAuthProvider clientId={CONFIG.googleOAuth.webClient}>{children}</GoogleOAuthProvider>
  );
}
