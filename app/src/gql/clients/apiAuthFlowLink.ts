import { ApolloLink, fromPromise, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
// import { NetworkError } from '@apollo/client/errors';
import { SiweMessage } from 'siwe';
import { tryAcquire, E_ALREADY_LOCKED, Mutex } from 'async-mutex';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/util/config';
import { atom, useRecoilState } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { useCallback, useMemo, useRef } from 'react';
import { captureException } from '~/util/sentry/sentry';
import { AuthToken } from 'lib';
import { useCredentials } from '@network/useCredentials';

const fetchMutex = new Mutex();

export const isServerError = (e?: unknown): e is ServerError =>
  typeof e === 'object' && e !== null && (e as any)['name'] === 'ServerError';

// https://test.com/abc/123 -> test.com; RN lacks URL support )':
const getHostname = (url: string) => {
  const start = url.indexOf('//') + 2;
  const end = url.indexOf('/', start);
  return url.slice(start, end);
};

const fetchToken = async (credentials: zk.Wallet): Promise<string> => {
  const nonceRes = await fetch(`${CONFIG.apiUrl}/auth/nonce`, {
    credentials: 'include',
  });
  const nonce = await nonceRes.text();

  const message = new SiweMessage({
    domain: getHostname(CONFIG.apiUrl),
    address: credentials.address,
    nonce,
  });
  const token: AuthToken = {
    message,
    signature: await credentials.signMessage(message.prepareMessage()),
  };

  return JSON.stringify(token);
};

const apiTokenState = atom<string | null>({
  key: 'apiToken',
  default: null,
  effects: [
    persistAtom({
      storage: getSecureStore(),
    }),
  ],
});

export const useAuthFlowLink = () => {
  const credentials = useCredentials();
  const [token, setToken] = useRecoilState(apiTokenState);

  const tokenRef = useRef<string | null>(token);

  const reset = useCallback(async () => {
    // Ensure token is reset exactly once at any given time
    try {
      await tryAcquire(fetchMutex).runExclusive(async () => {
        tokenRef.current = await fetchToken(credentials);
        setToken(tokenRef.current);
      });
    } catch (e) {
      if (e === E_ALREADY_LOCKED) {
        await fetchMutex.waitForUnlock();
      } else {
        throw e;
      }
    }
  }, [credentials, setToken]);

  const authLink: ApolloLink = useMemo(
    () =>
      setContext(async (_request, prevContext) => {
        if (!tokenRef.current) await reset();

        return {
          ...prevContext,
          headers: {
            ...prevContext.headers,
            Authorization: tokenRef.current,
          },
        };
      }),
    [reset],
  );

  const onUnauthorizedLink: ApolloLink = useMemo(
    () =>
      onError(({ networkError, forward, operation }) => {
        if (isServerError(networkError)) {
          if (networkError.statusCode === 401) {
            fromPromise(reset()).flatMap(() => forward(operation));
          } else {
            console.error({
              status: networkError.statusCode,
              name: networkError.name,
              message: networkError.message,
              result: JSON.stringify(networkError.result),
            });

            captureException(networkError, {
              extra: { operation },
            });
          }
        } else if (networkError) {
          console.warn('API network error', JSON.stringify(networkError.message, null, 2));
        }
      }),
    [reset],
  );

  const link = useMemo(
    () => ApolloLink.from([authLink, onUnauthorizedLink]),
    [authLink, onUnauthorizedLink],
  );

  return link;
};
