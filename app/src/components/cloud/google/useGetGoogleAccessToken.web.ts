import { useGoogleLogin } from '@react-oauth/google';
import { Result, err, ok } from 'neverthrow';
import { GOOGLE_SCOPES } from './scopes';
import { useRef } from 'react';
import { type useGetGoogleAccessToken as nativeMethod } from './useGetGoogleAccessToken';
import { logError } from '~/util/analytics';

type Response = Result<string, null>;

export const useGetGoogleAccessToken: typeof nativeMethod = () => {
  const onResponse = useRef<(r: Response) => void | undefined>();

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: GOOGLE_SCOPES.join(' '),
    onSuccess: (r) => {
      onResponse.current?.(ok(r.access_token));
    },
    onError: (e) => {
      logError('OAuth error getting Google access token (web)', e);
      onResponse.current?.(err(null));
    },
    onNonOAuthError: (e) => {
      logError('Non-OAuth error getting Google access token (web)', e);
      onResponse.current?.(err(null));
    },
  });

  return async (subject: string) => {
    const p = new Promise<Response>((resolve) => (onResponse.current = resolve));
    login({ hint: subject });

    return (await p).mapErr(() => 'failed-to-get-access-token' as const);
  };
};
