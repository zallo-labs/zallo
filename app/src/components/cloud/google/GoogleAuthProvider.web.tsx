import { GoogleOAuthProvider } from '@react-oauth/google';
import { PropsWithChildren } from 'react';
import { CONFIG } from '~/util/config';

export function GoogleAuthProvider({ children }: PropsWithChildren) {
  // Required by @react-oauth/google
  return (
    <GoogleOAuthProvider clientId={CONFIG.googleOAuth.webClient}>{children}</GoogleOAuthProvider>
  );
}
