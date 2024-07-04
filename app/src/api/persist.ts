import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, InteractionManager, NativeEventSubscription } from 'react-native';
import { Middleware } from 'react-relay-network-modern';
import { RecordSource, Store } from 'relay-runtime';

const KEY_PREFIX = 'relay:';
const INTERVAL = 10_000;

export async function restoreRelayRecords(key: string) {
  const json = await AsyncStorage.getItem(KEY_PREFIX + key);
  const records = json ? JSON.parse(json) : undefined;
  return new RecordSource(records);
}

export function persistCache(key: string, store: Store): Middleware {
  const storeKey = KEY_PREFIX + key;
  let lastSaved = Date.now();
  let pending: { timer: NodeJS.Timeout; listener: NativeEventSubscription } | undefined;

  function save() {
    if (pending) {
      clearTimeout(pending.timer);
      pending.listener.remove();
      pending = undefined;
    }

    const now = Date.now();
    const sinceSave = now - lastSaved;
    if (sinceSave >= INTERVAL) {
      lastSaved = now;

      const data = store.getSource().toJSON();
      AsyncStorage.setItem(storeKey, JSON.stringify(data));
    } else {
      // Debounce save
      const timer = setTimeout(save, INTERVAL - sinceSave);

      // Save pending immediately on background
      const listener = AppState.addEventListener('change', (state) => {
        if (state === 'background') save();
      });

      pending = { timer, listener };
    }
  }

  return (next) => async (req) => {
    const resp = await next(req);
    InteractionManager.runAfterInteractions(save);
    return resp;
  };
}
