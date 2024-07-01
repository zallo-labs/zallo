import { useCallback, useEffect, useRef } from 'react';
import { AppState, InteractionManager } from 'react-native';
import { useRelayEnvironment } from 'react-relay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RELAY_STORE_KEY } from './environment';

const ATMOST_INTERVAL = 30_000;
const ATLEAST_INTERVAL = 2 * 60_000;

export function RelayStorePersistor() {
  const environment = useRelayEnvironment();

  const lastSaved = useRef(Date.now());
  const save = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      const now = Date.now();
      if (now - lastSaved.current < ATMOST_INTERVAL) return;
      lastSaved.current = now;

      const data = environment.getStore().getSource().toJSON();
      AsyncStorage.setItem(RELAY_STORE_KEY, JSON.stringify(data));
    });
  }, [environment]);

  useEffect(() => {
    const stateSub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') save();
    });

    const timer = setInterval(save, ATLEAST_INTERVAL);

    return () => {
      stateSub.remove();
      clearInterval(timer);
    };
  }, [save]);

  return null;
}
