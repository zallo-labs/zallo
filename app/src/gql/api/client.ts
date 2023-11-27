import 'core-js/full/symbol/async-iterator';
import { Client, fetchExchange, subscriptionExchange, mapExchange, OperationContext } from 'urql';
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeAsyncStorage } from '@urql/storage-rn';
import { persistedExchange } from '@urql/exchange-persisted';
import { retryExchange } from '@urql/exchange-retry';
import { devtoolsExchange } from '@urql/devtools';
import { CONFIG } from '~/util/config';
import { authExchange } from '@urql/exchange-auth';
import { Address, Hex } from 'lib';
import { DateTime } from 'luxon';
import { SiweMessage } from 'siwe';
import { atom, useAtomValue } from 'jotai';
import { DANGEROUS_approverAtom } from '~/lib/network/useApprover';
import { createClient as createWsClient } from 'graphql-ws';
import schema from './schema.generated';
import { logError } from '~/util/analytics';
import crypto from 'crypto';
import { CACHE_CONFIG } from './cache';
import { E_ALREADY_LOCKED, Mutex, tryAcquire } from 'async-mutex';
import { secureJsonStorage } from '~/lib/secure-storage/json';
import { LocalAccount } from 'viem';

const TOKEN_KEY = 'apiToken';

interface Token {
  message: SiweMessage;
  signature: Hex;
}

const client = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);

  const storage = secureJsonStorage<Token | null>();
  const initialToken = storage.getItem(TOKEN_KEY, null);
  let token: Token | null = null;
  let headers = getHeaders(token);

  const refreshMutex = new Mutex();
  async function refreshAuth() {
    try {
      await tryAcquire(refreshMutex).runExclusive(async () => {
        token ??= await initialToken;
        if (isInvalidToken(token)) {
          token = await createToken(await approver);
          storage.setItem(TOKEN_KEY, token);
        }
        headers = getHeaders(token);
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

  const isInvalidToken = (token: Token | null) =>
    !token ||
    (!!token.message.expirationTime &&
      DateTime.fromISO(token.message.expirationTime) <= DateTime.now());
  const willAuthError = () => isInvalidToken(token);

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
      __DEV__ && devtoolsExchange,
      mapExchange({
        onError(error, operation) {
          logError('[urql] error: ' + error.message, { error, operation });
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
          if (operation.context.skipAddAuthToOperation) return operation;

          return utils.appendHeaders(operation, headers);
        },
        didAuthError(error, _operation) {
          return error.response?.status === 401; // Unauthorized
        },
        refreshAuth,
        willAuthError,
      })),
      retryExchange({}),
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
    ].filter(Boolean),
  });
});

export const useUrqlApiClient = () => useAtomValue(client);

interface CreateTokenApprover {
  address: Address;
  signMessage: (m: { message: string }) => Promise<Hex>;
}

async function createToken(approver: CreateTokenApprover): Promise<Token> {
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
    signature: await approver.signMessage({ message: message.prepareMessage() }),
  };
}

function getHeaders(token: Token | null): { Authorization?: string } {
  return { Authorization: token ? JSON.stringify(token) : undefined };
}

export async function authContext(
  options: CreateTokenApprover,
): Promise<Partial<OperationContext>> {
  return {
    fetchOptions: { headers: getHeaders(await createToken(options)) },
    skipAddAuthToOperation: true,
  };
}
