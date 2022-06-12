import { ApolloLink, fromPromise, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { NetworkError } from '@apollo/client/errors';
import { SiweMessage } from 'siwe';
import * as storage from 'expo-secure-store';

import { CONFIG } from '~/config';
import { PROVIDER } from '~/provider';
import { walletState } from '@features/wallet/useWallet';
import {
  selector,
  atom,
  useRecoilValue,
  useResetRecoilState,
  useRecoilRefresher_UNSTABLE,
} from 'recoil';
import { getSecureStore, persistAtom } from '@util/persistAtom';
import { useMemo } from 'react';

interface Token {
  message: SiweMessage;
  signature: string;
}

const isServerError = (e?: NetworkError): e is ServerError =>
  e?.name === 'ServerError';

// https://test.com/abc/123 -> test.com; RN has no URL support )':
const getHost = (url: string) => {
  const start = url.indexOf('//') + 2;
  const end = url.indexOf('/', start);
  return url.slice(start, end);
};

const fetchTokenSelector = selector<Token>({
  key: 'fetchToken',
  get: async ({ get }): Promise<Token> => {
    const wallet = get(walletState);

    const nonceRes = await fetch(`${CONFIG.api.url}/auth/nonce`, {
      credentials: 'include',
    });
    const nonce = await nonceRes.text();

    const message = new SiweMessage({
      address: wallet.address,
      nonce,
      statement: 'Sign into MetaSafe',
      chainId: PROVIDER.network.chainId,
      version: '1',
      uri: CONFIG.api.url,
      domain: getHost(CONFIG.api.url),
    });

    return {
      message,
      signature: await wallet.signMessage(message.prepareMessage()),
    };
  },
});

const apiTokenState = atom<Token>({
  key: 'apiToken',
  default: fetchTokenSelector,
  effects: [
    persistAtom({
      storage: getSecureStore(),
    }),
  ],
});

export const useAuthFlowLink = () => {
  const token = useRecoilValue(apiTokenState);
  const resetToken = useResetRecoilState(apiTokenState);
  const refreshFetchToken = useRecoilRefresher_UNSTABLE(fetchTokenSelector);

  const authLink: ApolloLink = useMemo(
    () =>
      setContext(async (_request, prevContext) => {
        // Disregard token if the message has expired
        if (
          !token ||
          (token.message.expirationTime &&
            new Date(token.message.expirationTime) <= new Date())
        ) {
          resetToken();
        }

        return {
          ...prevContext,
          headers: {
            ...prevContext.headers,
            authorization: JSON.stringify(token),
          },
        };
      }),
    [resetToken, token],
  );

  const onUnauthorizedLink: ApolloLink = useMemo(
    () =>
      onError(({ networkError, forward, operation }) => {
        if (isServerError(networkError) && networkError.statusCode === 401) {
          refreshFetchToken();
          resetToken();
          forward(operation);
        }
      }),
    [refreshFetchToken, resetToken],
  );

  const link = useMemo(
    () => ApolloLink.from([authLink, onUnauthorizedLink]),
    [authLink, onUnauthorizedLink],
  );

  return link;
};
