import { ApolloLink, fromPromise, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { SiweMessage } from 'siwe';
import { tryAcquire, E_ALREADY_LOCKED, Mutex } from 'async-mutex';
import { CONFIG } from '~/util/config';
import { atom, useRecoilState } from 'recoil';
import { getSecureStore, persistAtom } from '~/util/effect/persistAtom';
import { useCallback, useMemo, useRef } from 'react';
import { captureException } from '~/util/sentry/sentry';
import { useApprover } from '@network/useApprover';
import { DateTime } from 'luxon';
import { Approver } from 'lib';

const fetchMutex = new Mutex();

export const isServerError = (e?: unknown): e is ServerError =>
  typeof e === 'object' && e !== null && (e as any)['name'] === 'ServerError';

const HOST_PATTERN = /^(?:[a-z]+?:\/\/)?([^:/?#]+(:\d+)?)/; // RN lacks URL support )':
//                      protocol://      (hostname:port)
const API_HOSTNAME = HOST_PATTERN.exec(CONFIG.apiUrl)![1];

const fetchToken = async (approver: Approver): Promise<string> => {
  const nonceResp = await fetch(`${CONFIG.apiUrl}/auth/nonce`, { credentials: 'include' });

  const message = new SiweMessage({
    version: '1',
    domain: API_HOSTNAME,
    address: approver.address,
    nonce: await nonceResp.text(),
    expirationTime: DateTime.now().plus({ days: 2 }).toString(),
    // Required but unused
    uri: 'https://app.zallo.com',
    chainId: 0,
  });
  const token = {
    message,
    signature: await approver.signMessage(message.prepareMessage()),
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

export const useApiAuth = () => {
  const approver = useApprover();
  const [token, setToken] = useRecoilState(apiTokenState);

  const tokenRef = useRef<string | null>(token);

  const reset = useCallback(async () => {
    // Ensure token is reset exactly once at any given time
    try {
      await tryAcquire(fetchMutex).runExclusive(async () => {
        tokenRef.current = await fetchToken(approver);
        setToken(tokenRef.current);
      });
    } catch (e) {
      if (e === E_ALREADY_LOCKED) {
        await fetchMutex.waitForUnlock();
      } else {
        throw e;
      }
    }
  }, [approver, setToken]);

  return useMemo(() => {
    const getHeaders = () => ({ Authorization: tokenRef.current });

    const setHeadersLink = setContext(async (_request, prevContext) => {
      if (!tokenRef.current) await reset();

      return {
        ...prevContext,
        headers: {
          ...prevContext.headers,
          ...getHeaders(),
        },
      };
    });

    const onUnauthorizedLink: ApolloLink = onError(({ networkError, forward, operation }) => {
      if (isServerError(networkError)) {
        if (networkError.statusCode === 401) {
          fromPromise(reset()).flatMap(() => forward(operation));
        } else {
          console.error(
            JSON.stringify({
              status: networkError.statusCode,
              name: networkError.name,
              message: networkError.message,
              result: JSON.stringify(networkError.result),
            }),
            null,
            2,
          );

          captureException(networkError, { extra: { operation } });
        }
      } else if (networkError) {
        console.warn('API network error', JSON.stringify(networkError, null, 2));
      }
    });

    const link = ApolloLink.from([setHeadersLink, onUnauthorizedLink]);

    return { link, getHeaders };
  }, [reset]);
};
