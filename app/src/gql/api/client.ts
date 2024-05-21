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
import { logError } from '~/util/analytics';
import crypto from 'crypto';
import { CACHE_SCHEMA_CONFIG } from './cache';
import { E_ALREADY_LOCKED, Mutex, tryAcquire } from 'async-mutex';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'jotai/utils';
import { requestPolicyExchange } from '@urql/exchange-request-policy';

const TOKEN_KEY = 'api-token';
const storage = createJSONStorage<Token | null>(() => AsyncStorage);

interface Token {
  message: Partial<SiweMessage>;
  signature: Hex;
}

interface State {
  token: Token;
  headers: ReturnType<typeof getHeaders>;
}

const client = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);

  let initialToken: PromiseLike<Token | null> | null = storage.getItem(TOKEN_KEY, null);
  let state: State | null = null;

  const refreshMutex = new Mutex();
  async function refreshAuth() {
    try {
      await tryAcquire(refreshMutex).runExclusive(async () => {
        let token = null;
        if (initialToken) {
          token = await initialToken;
          initialToken = null;
        }

        if (!token || isInvalidToken(token)) {
          token = await createToken(await approver);
          storage.setItem(TOKEN_KEY, token);
        }
        state = { token, headers: getHeaders(token) };
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

  const willAuthError = () => !state || isInvalidToken(state.token);

  const wsClient = createWsClient({
    url: CONFIG.apiGqlWs,
    lazy: true,
    retryAttempts: 10,
    async connectionParams() {
      if (willAuthError()) await refreshAuth();
      return state?.headers ?? {};
    },
  });

  return new Client({
    url: `${CONFIG.apiUrl}/graphql`,
    suspense: true,
    exchanges: [
      __DEV__ && devtoolsExchange,
      mapExchange({
        onError(error, operation) {
          logError('[urql] error: ' + error.message, { error, operation });
        },
      }),
      requestPolicyExchange({ ttl: 60_000 /* ms */ }),
      // refocusExchange(),
      offlineExchange({
        storage: makeAsyncStorage({
          dataKey: 'urql-data', // AsyncStorage key
          metadataKey: 'urql-metadata', // AsyncStorage key
          maxAge: 28, // How many days to persist the data in storage
        }),
        ...CACHE_SCHEMA_CONFIG,
      }),
      authExchange(async (utils) => ({
        addAuthToOperation(operation) {
          if (operation.context.skipAddAuthToOperation) return operation;

          return utils.appendHeaders(operation, state?.headers ?? {});
        },
        didAuthError(error, _operation) {
          return (
            error.response?.status === 401 ||
            !!error.graphQLErrors.find((e) => e.extensions.code === 'UNAUTHENTICATED')
          );
        },
        refreshAuth,
        willAuthError,
      })),
      persistedExchange({
        generateHash: async (query, _document) =>
          crypto.createHash('sha256').update(query).digest('hex'),
      }),
      retryExchange({ maxNumberAttempts: 5, maxDelayMs: 30000 }),
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
    uri: CONFIG.webAppUrl, // Required but unused by api
    chainId: 0,
  });

  return {
    message,
    signature: await approver.signMessage({ message: message.prepareMessage() }),
  };
}

function getHeaders(token: Token): { Authorization: string } {
  return {
    Authorization: JSON.stringify({
      message: new SiweMessage(token.message).prepareMessage(),
      signature: token.signature,
    }),
  };
}

function isInvalidToken(token: Token) {
  return (
    !!token.message.expirationTime &&
    DateTime.fromISO(token.message.expirationTime) <= DateTime.now()
  );
}

export async function authContext(
  options: CreateTokenApprover,
): Promise<Partial<OperationContext>> {
  return {
    fetchOptions: { headers: getHeaders(await createToken(options)) },
    skipAddAuthToOperation: true,
  };
}
