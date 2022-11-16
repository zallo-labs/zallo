import { ApolloLink, fromPromise, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
// import { NetworkError } from '@apollo/client/errors';
import { SiweMessage } from 'siwe';
import { tryAcquire, E_ALREADY_LOCKED, Mutex } from 'async-mutex';
import * as zk from 'zksync-web3';
import { CONFIG } from '~/util/config';
import { PROVIDER } from '~/util/network/provider';
import { atom, useRecoilState } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { useCallback, useMemo, useRef } from 'react';
import { captureException } from '~/util/sentry/sentry';
import { useDevice } from '@network/useDevice';

interface Token {
  message: SiweMessage;
  signature: string;
}

const fetchMutex = new Mutex();

export const isServerError = (e?: unknown): e is ServerError =>
  typeof e === 'object' && e !== null && (e as any)['name'] === 'ServerError';

// https://test.com/abc/123 -> test.com; RN lacks URL support )':
const getHost = (url: string) => {
  const start = url.indexOf('//') + 2;
  const end = url.indexOf('/', start);
  return url.slice(start, end);
};

const fetchToken = async (wallet: zk.Wallet): Promise<Token> => {
  const nonceRes = await fetch(`${CONFIG.apiUrl}/auth/nonce`, {
    credentials: 'include',
  });
  const nonce = await nonceRes.text();

  const message = new SiweMessage({
    address: wallet.address,
    nonce,
    statement: 'Sign into Zallo',
    chainId: PROVIDER.network.chainId,
    version: '1',
    uri: CONFIG.apiUrl,
    domain: getHost(CONFIG.apiUrl),
  });

  return {
    message,
    signature: await wallet.signMessage(message.prepareMessage()),
  };
};

const apiTokenState = atom<Token | null>({
  key: 'apiToken',
  default: null,
  effects: [
    persistAtom({
      storage: getSecureStore(),
    }),
  ],
});

export const useAuthFlowLink = () => {
  const device = useDevice();
  const [token, setToken] = useRecoilState(apiTokenState);

  const tokenRef = useRef<Token | null>(token);

  const reset = useCallback(async () => {
    // Ensure token is reset exactly once at any given time
    try {
      await tryAcquire(fetchMutex).runExclusive(async () => {
        tokenRef.current = await fetchToken(device);
        setToken(tokenRef.current);
      });
    } catch (e) {
      if (e === E_ALREADY_LOCKED) {
        await fetchMutex.waitForUnlock();
      } else {
        throw e;
      }
    }
  }, [device, setToken]);

  const authLink: ApolloLink = useMemo(
    () =>
      setContext(async (_request, prevContext) => {
        if (!tokenRef.current) await reset();

        return {
          ...prevContext,
          headers: {
            ...prevContext.headers,
            authorization: JSON.stringify(tokenRef.current),
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
