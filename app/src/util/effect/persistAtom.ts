import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtomEffect, DefaultValue } from 'recoil';
import * as SecureStore from 'expo-secure-store';

interface Storage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

type Save<T> = (value: T) => string;
type Load<T> = (saved: string) => T;

interface Wrapped {
  data: string;
}

const serialize = <T>(data: T, save: Save<T>): string => {
  const wrapped: Wrapped = { data: save(data) ?? null };
  return JSON.stringify(wrapped);
};

const deserialize = <T>(serialized: string, load: Load<T>): T => {
  const wrapped: Wrapped = JSON.parse(serialized);
  return load(wrapped.data ?? null);
};

export const getSecureStore = (
  options?: SecureStore.SecureStoreOptions,
): Storage => ({
  getItem: (key) => SecureStore.getItemAsync(key, options),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, options),
  removeItem: (key) => SecureStore.deleteItemAsync(key, options),
});

export interface PersistAtomOptions<T> {
  save?: Save<T>;
  load?: Load<T>;
  storage?: Storage;
  saveIf?: (value: T) => boolean;
}

export const persistAtom =
  <T>({
    save = JSON.stringify,
    load = JSON.parse,
    storage = AsyncStorage,
    saveIf,
  }: PersistAtomOptions<T> = {}): AtomEffect<T> =>
  ({ setSelf, onSet, node: { key } }) => {
    // Loads the saved value, otherwise uses the default value
    setSelf(
      storage.getItem(key).then((saved) => {
        return saved != null ? deserialize(saved, load) : new DefaultValue();
      }),
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _oldValue, isReset) => {
      if (isReset) {
        storage.removeItem(key);
      } else if (!saveIf || saveIf(newValue)) {
        storage.setItem(key, serialize(newValue, save));
      }
    });
  };
