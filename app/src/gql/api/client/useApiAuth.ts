import { ApolloLink, fromPromise } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { SiweMessage } from 'siwe';
import { tryAcquire, E_ALREADY_LOCKED, Mutex } from 'async-mutex';
import { CONFIG } from '~/util/config';
import { useCallback, useMemo, useRef } from 'react';
import { useApproverWallet } from '@network/useApprover';
import { DateTime } from 'luxon';
import { Approver } from 'lib';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtom } from 'jotai';

const tokenAtom = persistedAtom<string | null>('ApiToken', null);

const fetchMutex = new Mutex();

export const useApiAuth = () => {
  const approver = useApproverWallet();
  const [token, setToken] = useAtom(tokenAtom);

  const tokenRef = useRef<string | null>(token);

  const reset = useCallback(async () => {
    // Ensure token is reset exactly once at any given time
    try {
      await tryAcquire(fetchMutex).runExclusive(async () => {
        tokenRef.current = await getToken(approver);
        setToken(tokenRef.current);
      });
    } catch (e) {
      if (e === E_ALREADY_LOCKED) {
        await fetchMutex.waitForUnlock();
        // Token has been reset by another call
      } else {
        throw e;
      }
    }
  }, [approver, setToken]);

  return useMemo(() => {
    const getHeaders = () => ({ Authorization: `Bearer ${tokenRef.current}` });

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

    const onUnauthorizedLink: ApolloLink = onError(({ forward, operation, networkError }) => {
      // On unauthorized (401) reset the token and retry the request
      if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
        return fromPromise(reset()).flatMap(() => forward(operation));
      }
    });

    const link = ApolloLink.from([onUnauthorizedLink, setHeadersLink]);

    return { link, getHeaders };
  }, [reset]);
};

const HOST_PATTERN = /^(?:[a-z]+?:\/\/)?([^:/?#]+(:\d+)?)/; // RN lacks URL support )':
//                      protocol://      (hostname:port)
const API_HOSTNAME = HOST_PATTERN.exec(CONFIG.apiUrl)![1];

async function getToken(approver: Approver): Promise<string> {
  // Cookies are problematic on RN - https://github.com/facebook/react-native/issues/23185
  // const nonce = await (await fetch(`${CONFIG.apiUrl}/auth/nonce`, { credentials: 'include' })).text();
  const nonce = 'nonceless';

  const message = new SiweMessage({
    version: '1',
    domain: API_HOSTNAME,
    address: approver.address,
    nonce,
    expirationTime: DateTime.now().plus({ days: 2 }).toString(),
    uri: 'https://app.zallo.com', // Required but unused
    chainId: 0,
  });

  const token = {
    message,
    signature: await approver.signMessage(message.prepareMessage()),
  };

  return JSON.stringify(token);
}
