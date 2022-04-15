import { ApolloLink, fromPromise, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { NetworkError } from '@apollo/client/errors';
import * as SecureStore from 'expo-secure-store';
import { SiweMessage } from 'siwe';
import { Wallet } from 'ethers';

import { CONFIG } from '~/config';
import { CHAIN } from '@provider';

const TOKEN_KEY = 'api-token';

interface Token {
  message: SiweMessage;
  signature: string;
}

const isServerError = (e?: NetworkError): e is ServerError => e?.name === 'ServerError';

// https://test.com/abc/123 -> test.com; RN has no URL support )':
const getHost = (url: string) => {
  const start = url.indexOf('//') + 2;
  const end = url.indexOf('/', start);
  return url.slice(start, end);
};

const fetchNewToken = async (wallet: Wallet) => {
  const nonceRes = await fetch(`${CONFIG.api.url}/auth/nonce`, {
    credentials: 'include',
  });
  const nonce = await nonceRes.text();

  const message = new SiweMessage({
    address: wallet.address,
    nonce,
    statement: 'Sign into MetaSafe',
    chainId: CHAIN.id,
    version: '1',
    uri: CONFIG.api.url,
    domain: getHost(CONFIG.api.url),
  });

  const token: Token = {
    message,
    signature: await wallet.signMessage(message.prepareMessage()),
  };

  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(token));

  return token;
};

const createWithTokenLink = (wallet: Wallet) =>
  setContext(async (_request, prevContext) => {
    let data: Token | null = JSON.parse(await SecureStore.getItemAsync(TOKEN_KEY));

    // Disregard data if the message has expired
    if (data?.message.expirationTime && new Date(data.message.expirationTime) <= new Date())
      data = null;

    if (!data) data = await fetchNewToken(wallet);

    return {
      ...prevContext,
      headers: {
        ...prevContext.headers,
        authorization: JSON.stringify(data),
      },
    };
  });

const resetTokenLink = onError(({ networkError, forward, operation }) => {
  if (isServerError(networkError) && networkError.statusCode === 401) {
    return fromPromise(SecureStore.deleteItemAsync(TOKEN_KEY)).flatMap(() => forward(operation));
  }
});

export const createAuthFlowLink = (wallet: Wallet) =>
  ApolloLink.from([createWithTokenLink(wallet), resetTokenLink]);
