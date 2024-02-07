import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { PropsWithChildren } from 'react';
import { GOOGLE_SCOPES } from './scopes';
import { CONFIG } from '~/util/config';

// Google OAuth setup - used by Android & iOS
GoogleSignin.configure({
  scopes: GOOGLE_SCOPES,
  webClientId: CONFIG.googleOAuth.webClient,
  iosClientId: CONFIG.googleOAuth.iosClient,
});

export function GoogleAuthProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
