import { useGoogleLogin } from '@react-oauth/google';
import { Result, err, ok } from 'neverthrow';
import { GOOGLE_SCOPES } from './scopes';
import { useRef } from 'react';
import { logError } from '~/util/analytics';

type TokenResult = Result<string, null>;

export function useSignInWithGoogle() {
  const onAccessToken = useRef<(r: TokenResult) => void | undefined>();
  const login = useGoogleLogin({
    flow: 'implicit',
    scope: GOOGLE_SCOPES.join(' '),
    onSuccess: async (r) => {
      onAccessToken.current?.(ok(r.access_token));
    },
    onError: (e) => {
      logError('OAuth error getting Google access token (web)', e);
      onAccessToken.current?.(err(null));
    },
    onNonOAuthError: (e) => {
      if (e.type !== 'popup_closed')
        logError('Non-OAuth error getting Google access token (web)', e);
      onAccessToken.current?.(err(null));
    },
  });

  return async (subject?: string) => {
    const promisedResult = new Promise<TokenResult>((resolve) => (onAccessToken.current = resolve));
    login({ hint: subject });

    return (await promisedResult)
      .map((accessToken) => ({ accessToken }))
      .mapErr(() => 'failed-to-get-access-token' as const);
  };
}
