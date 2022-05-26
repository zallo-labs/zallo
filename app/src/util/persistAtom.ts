import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtomEffect, DefaultValue } from 'recoil';
import * as SecureStore from 'expo-secure-store';

interface Storage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const getSecureStore = (
  options?: SecureStore.SecureStoreOptions,
): Storage => ({
  getItem: (key) => SecureStore.getItemAsync(key, options),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, options),
  removeItem: (key) => SecureStore.deleteItemAsync(key, options),
});

export interface PersistAtomOptions<T> {
  save?: (value: T) => string;
  load?: (saved: string) => T;
  storage?: Storage;
  ignoreDefault?: boolean;
}

export const persistAtom =
  <T>({
    save = JSON.stringify,
    load = JSON.parse,
    storage = AsyncStorage,
    ignoreDefault,
  }: PersistAtomOptions<T> = {}): AtomEffect<T> =>
  ({ setSelf, onSet, node: { key } }) => {
    // Loads the saved value, otherwise uses the default value
    setSelf(
      storage.getItem(key).then((saved) => {
        return saved != null ? load(saved) : new DefaultValue();
      }),
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _oldValue, isReset) => {
      if (isReset && ignoreDefault) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, save(newValue));
      }
    });
  };
