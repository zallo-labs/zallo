import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtomEffect, DefaultValue } from 'recoil';

const DEFAULT_EQ = <T>(a: T, b: T) => a === b;

export interface PersistAtomOptions<T> {
  save?: (value: T) => string;
  load?: (saved: string) => T;
  eq?: (a: T, b: T) => boolean;
}

export const persistAtom =
  <T>({
    save = JSON.stringify,
    load = JSON.parse,
    eq = DEFAULT_EQ,
  }: PersistAtomOptions<T> = {}): AtomEffect<T> =>
  ({ setSelf, onSet, trigger, node: { key } }) => {
    const loadPersisted = async () => {
      const saved = await AsyncStorage.getItem(key);
      if (saved !== null) setSelf(load(saved));
    };

    // Asynchronously set the persisted data
    if (trigger === 'get') loadPersisted();

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, oldValue, isReset) => {
      if (isReset) {
        AsyncStorage.removeItem(key);
      } else if (oldValue instanceof DefaultValue || !eq(newValue, oldValue)) {
        AsyncStorage.setItem(key, save(newValue));
      }
    });
  };
