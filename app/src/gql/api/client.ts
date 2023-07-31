import 'core-js/full/symbol/async-iterator';
import { Client, fetchExchange, subscriptionExchange, mapExchange } from 'urql';
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeAsyncStorage } from '@urql/storage-rn';
import { persistedExchange } from '@urql/exchange-persisted';
import { retryExchange } from '@urql/exchange-retry';
import { CONFIG } from '~/util/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authExchange } from '@urql/exchange-auth';
import { Approver, Hex, asHex } from 'lib';
import { DateTime } from 'luxon';
import { SiweMessage } from 'siwe';
import { atom, useAtomValue } from 'jotai';
import { DANGEROUS_approverAtom } from '@network/useApprover';
import { createClient as createWsClient } from 'graphql-ws';
import schema from './schema';
import { logError } from '~/util/analytics';
import crypto from 'react-native-quick-crypto';
import { CACHE_CONFIG } from './cache';
import { E_ALREADY_LOCKED, Mutex, tryAcquire } from 'async-mutex';

const TOKEN_KEY = 'apiToken';

interface Token {
  message: SiweMessage;
  signature: Hex;
}

const client = atom(async (get) => {
  const approver = await get(DANGEROUS_approverAtom);

  let token = JSON.parse((await AsyncStorage.getItem(TOKEN_KEY)) || '') as Token | null;
  let headers = getHeaders(token);

  const refreshMutex = new Mutex();
  async function refreshAuth() {
    try {
      await tryAcquire(refreshMutex).runExclusive(async () => {
        token = await createToken(approver);
        headers = getHeaders(token);
        await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(token));
      });
    } catch (e) {
      if (e === E_ALREADY_LOCKED) {
        // Wait for token to be recreated
        await refreshMutex.waitForUnlock();
      } else {
        throw e;
      }
    }
  }

  const willAuthError = () =>
    !token ||
    (!!token.message.expirationTime &&
      DateTime.fromISO(token.message.expirationTime) <= DateTime.now());

  const wsClient = createWsClient({
    url: CONFIG.apiGqlWs,
    lazy: true,
    retryAttempts: 10,
    async connectionParams() {
      if (willAuthError()) await refreshAuth();
      return headers;
    },
  });

  return new Client({
    url: `${CONFIG.apiUrl}/graphql`,
    fetchOptions: { credentials: 'include' },
    suspense: true,
    requestPolicy: 'cache-and-network',
    exchanges: [
      mapExchange({
        onError(error, _operation) {
          logError('[urql] error: ' + error.message, {
            error,
            network: error.networkError?.message,
          });
        },
      }),
      // refocusExchange(),
      offlineExchange({
        schema,
        storage: makeAsyncStorage({
          dataKey: 'urql-data', // AsyncStorage key
          metadataKey: 'urql-metadata', // AsyncStorage key
          maxAge: 28, // How many days to persist the data in storage
        }),
        ...CACHE_CONFIG,
      }),
      persistedExchange({
        generateHash: async (query, _document) =>
          crypto.createHash('sha256').update(query).digest('hex'),
      }),
      authExchange(async (utils) => ({
        addAuthToOperation(operation) {
          return utils.appendHeaders(operation, headers);
        },
        didAuthError(error, _operation) {
          return error.response?.status === 401; // Unauthorized
        },
        refreshAuth,
        willAuthError,
      })),
      retryExchange({ maxNumberAttempts: 5 }),
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(request) {
          const input = { ...request, query: request.query || '' };
          return {
            subscribe(sink) {
              const unsubscribe = wsClient.subscribe(input, sink);
              return { unsubscribe };
            },
          };
        },
      }),
    ],
  });
});

export const useUrqlApiClient = () => useAtomValue(client);

async function createToken(approver: Approver): Promise<Token> {
  // Cookies are problematic on RN - https://github.com/facebook/react-native/issues/23185
  // const nonce = await (await fetch(`${CONFIG.apiUrl}/auth/nonce`, { credentials: 'include' })).text();
  const nonce = 'nonceless';

  const message = new SiweMessage({
    version: '1',
    domain: new URL(CONFIG.apiUrl).host,
    address: approver.address,
    nonce,
    expirationTime: DateTime.now().plus({ days: 2 }).toString(),
    uri: 'https://app.zallo.com', // Required but unused
    chainId: 0,
  });

  return {
    message,
    signature: asHex(await approver.signMessage(message.prepareMessage())),
  };
}

function getHeaders(token: Token | null): { Authorization?: string } {
  return { Authorization: token ? JSON.stringify(token) : undefined };
}
