import { Environment, RecordSource, Store } from 'relay-runtime';
import { PrivateKeyAccount } from 'viem';
import { atom, useAtomValue } from 'jotai';
import { DANGEROUS_approverAtom } from '@network/useApprover';
import { InteractionManager } from 'react-native';
import { atomFamily } from 'jotai/utils';
import { createNetworkLayer } from './network/layer';
import { fetchExchange } from './network/fetch';
import { CONFIG } from '~/util/config';
import { createClient } from 'graphql-ws';
import { subscriptionExchange } from './network/subscription';
import { authExchange } from './network/auth';
import { getAuthManager } from './auth-manager';
import { mapExchange } from './network/map';
import { missingFieldHandlers } from './field-handlers';
import { persistedQueryExchange } from './network/persistedQuery';
import { retryExchange } from './network/retry';
import { PersitedRecordSource } from './PersistedRecordSource';

const environmentAtom = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);
  return getEnvironment({ key: 'main', approver, persist: true });
});

export function useApiEnvironment() {
  return useAtomValue(environmentAtom);
}

const approverEnvironment = atomFamily(
  (approver: PrivateKeyAccount) =>
    atom(async () => {
      const promisedApprover = new Promise<PrivateKeyAccount>((resolve) => resolve(approver));
      return getEnvironment({ key: approver.address, approver: promisedApprover, persist: false });
    }),
  (a, b) => a.address === b.address,
);

export function useApproverApiEnvironment(approver: PrivateKeyAccount) {
  return useAtomValue(approverEnvironment(approver));
}

export interface EnvironmentConfig {
  key: string;
  approver: Promise<PrivateKeyAccount>;
  persist?: boolean;
}

export let environment: Environment | undefined;
export function setEnvironment(env: Environment) {
  environment = env;
}

export async function getEnvironment({ key, approver, persist }: EnvironmentConfig) {
  if (environment) return environment;

  const [recordSource, authManager] = await Promise.all([
    persist ? PersitedRecordSource.restore(`relay:${key}`) : new RecordSource(),
    getAuthManager(approver),
  ]);

  if (environment) return environment;

  const store = new Store(recordSource, {
    gcReleaseBufferSize: 100, // gc exempt queries
    queryCacheExpirationTime: 10 * 60_000,
    gcScheduler: (run) => {
      InteractionManager.runAfterInteractions(run);
    },
  });
  // persist && store.notify(undefined, true); // Invalidate persisted data

  const network = createNetworkLayer({
    store,
    exchanges: [
      mapExchange({
        // onRequest: (request) => console.debug('[Request]', request),
        // onResponse: (result) => console.debug('[Response]', result),
        onGraphQLError: (result) => console.error('[GraphQL Error]', result),
        onNetworkError: (result) => console.error('[Network Error]', result),
      }),
      retryExchange(),
      authExchange(authManager),
      persistedQueryExchange(),
      fetchExchange({ url: `${CONFIG.apiUrl}/graphql` }),
      subscriptionExchange(
        createClient({
          url: CONFIG.apiGqlWs,
          lazy: true,
          retryAttempts: 15,
          connectionParams: authManager.getAuthHeaders,
        }),
      ),
    ],
  });

  environment = new Environment({
    configName: key,
    network,
    store,
    missingFieldHandlers,
    requiredFieldLogger: (field) => console.warn('[Missing field]', field),
    // @ts-expect-error types are wrong
    relayFieldLogger: (field) => console.error('[Relay]', field),
  });

  return environment;
}
