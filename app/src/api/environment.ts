import { Environment, RecordSource, RelayFeatureFlags, Store } from 'relay-runtime';
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
import { persistExchange, restoreRelayRecords } from './network/persist';
import { authExchange } from './network/auth';
import { getAuthManager } from './auth-manager';
import { mapExchange } from './network/map';
import { missingFieldHandlers } from './field-handlers';

RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT = true;

const environmentAtom = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);
  return await getEnvironment({ key: 'main', approver, persist: true });
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

let environment: Environment | undefined;
export async function getEnvironment({ key, approver, persist }: EnvironmentConfig) {
  if (environment) return environment;

  const [initialRecords, authManager] = await Promise.all([
    persist ? restoreRelayRecords(key) : new RecordSource(),
    getAuthManager(approver),
  ]);

  if (environment) return environment;

  const store = new Store(initialRecords, {
    gcReleaseBufferSize: 100, // gc exempt queries
    queryCacheExpirationTime: 10 * 60_000,
    gcScheduler: (run) => {
      InteractionManager.runAfterInteractions(run);
    },
  });

  const network = createNetworkLayer({
    store,
    exchanges: [
      mapExchange({
        onRequest: (request) => {
          console.log('[Request]', request);
        },
        onResponse: (result) => {
          console.log('[Response]', result);
        },
        onGraphQLError: (result) => {
          console.error('[GraphQL Error]', result);
        },
        onNetworkError: (result) => {
          console.error('[Network Error]', result);
        },
      }),
      persistExchange(key, store),
      // retryExchange(),
      authExchange(authManager),
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

  console.trace('creating environment');

  environment = new Environment({
    configName: key,
    network,
    store,
    missingFieldHandlers,
    // UNSTABLE_defaultRenderPolicy: 'full',
  });

  return environment;
}
