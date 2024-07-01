import { Environment, RecordSource, Store } from 'relay-runtime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrivateKeyAccount } from 'viem';
import { getRelayNetwork } from './network';
import { atom, useAtomValue } from 'jotai';
import { DANGEROUS_approverAtom } from '@network/useApprover';
import { InteractionManager } from 'react-native';

export const RELAY_STORE_KEY = 'relay';

const environment = atom(async (get) => {
  const approver = get(DANGEROUS_approverAtom);
  return await getEnvironment(approver);
});

export function useApiEnvironment() {
  return useAtomValue(environment);
}

async function getEnvironment(approver: Promise<PrivateKeyAccount>) {
  const [persistedRecords, network] = await Promise.all([restore(), getRelayNetwork(approver)]);
  const source = new RecordSource(persistedRecords);
  const store = new Store(source, {
    gcReleaseBufferSize: 50, // gc exempt queries
    queryCacheExpirationTime: 5 * 60_000,
    gcScheduler: (run) => {
      InteractionManager.runAfterInteractions(run);
    },
  });

  return new Environment({
    network,
    store,
  });
}

async function restore() {
  const records = await AsyncStorage.getItem(RELAY_STORE_KEY);
  return records ? JSON.parse(records) : {};
}
