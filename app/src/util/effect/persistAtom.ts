import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtomEffect, DefaultValue } from 'recoil';
import * as SecureStore from 'expo-secure-store';
import { bigIntReviever } from 'lib';

export const DEFAULT_VERSION = 0;

interface Storage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

type Save<T> = (value: T) => string;
type Load<T> = (saved: string) => T;

interface Wrapped {
  data: string;
  version: number;
}

export const getSecureStore = (options?: SecureStore.SecureStoreOptions): Storage => ({
  getItem: (key) => SecureStore.getItemAsync(key, options),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, options),
  removeItem: (key) => SecureStore.deleteItemAsync(key, options),
});

export interface PersistAtomOptions<T> {
  save?: Save<T>;
  load?: Load<T>;
  storage?: Storage;
  saveIf?: (value: T, isDefault: boolean) => boolean;
  version?: number;
  migrate?: (value: unknown, version: number) => T;
}

export const persistAtom =
  <T>({
    save = JSON.stringify,
    load = (text) => JSON.parse(text, bigIntReviever),
    storage = AsyncStorage,
    saveIf,
    version = DEFAULT_VERSION,
    migrate,
  }: PersistAtomOptions<T> = {}): AtomEffect<T> =>
  ({ setSelf, onSet, node: { key } }) => {
    // Loads the saved value, otherwise uses the default value
    setSelf(
      storage.getItem(key).then((wrapped) => {
        if (wrapped === null) return new DefaultValue();

        const { data, version: dataVersion }: Wrapped = JSON.parse(wrapped);
        if (dataVersion !== version)
          return migrate ? migrate(load(data), dataVersion) : new DefaultValue();

        return load(data ?? null);
      }),
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _oldValue, isReset) => {
      if (!saveIf || saveIf(newValue, isReset)) {
        const wrapped: Wrapped = { data: save(newValue) ?? null, version };

        storage.setItem(key, JSON.stringify(wrapped));
      } else {
        storage.removeItem(key);
      }
    });
  };
