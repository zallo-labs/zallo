import { Environment, RecordSource, Store } from 'relay-runtime';
import { PrivateKeyAccount } from 'viem';
import { atom, useAtomValue } from 'jotai';
import { DANGEROUS_approverAtom } from '@network/useApprover';
import { InteractionManager } from 'react-native';
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
import { exponentialBackoffDelayWithJitter, retryExchange } from './network/retry';
import { PersitedRecordSource } from './PersistedRecordSource';

const environmentAtom = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);
  return getEnvironment({ key: 'main', approver, persist: true });
});

export function useApiEnvironment() {
  return useAtomValue(environmentAtom);
}

export interface EnvironmentConfig {
  key: string;
  approver: Promise<PrivateKeyAccount>;
  persist?: boolean;
}

let environment: Environment | undefined;
export async function getEnvironment({ key, approver, persist }: EnvironmentConfig) {
  if (environment) return environment;

  const [recordSource, authManager] = await Promise.all([
    persist ? PersitedRecordSource.restore(`relay:${key}`) : new RecordSource(),
    getAuthManager(approver),
  ]);

  if (environment) return environment;

  const store = new Store(recordSource, {
    gcReleaseBufferSize: 100, // Queries not retained excluded from GC
    gcScheduler: (run) => {
      InteractionManager.runAfterInteractions(run);
    },
  });

  const retries = 8;
  const network = createNetworkLayer({
    store,
    exchanges: [
      mapExchange({
        // onRequest: (request) => console.debug('[Request]', request),
        // onResponse: (result) => console.debug('[Response]', result),
        onGraphQLError: (result) => console.error('[GraphQL Error]', result),
        onNetworkError: (result) => console.error('[Network Error]', result),
      }),
      retryExchange({ maxAttempts: retries }),
      authExchange(authManager),
      persistedQueryExchange(),
      fetchExchange({ url: `${CONFIG.apiUrl}/graphql` }),
      subscriptionExchange(
        createClient({
          url: CONFIG.apiGqlWs,
          lazy: true,
          retryAttempts: retries,
          retryWait: (retries: number) =>
            new Promise((resolve) =>
              setTimeout(resolve, exponentialBackoffDelayWithJitter(retries)),
            ),
          connectionParams: () => authManager.getAuthHeaders(undefined, undefined),
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
