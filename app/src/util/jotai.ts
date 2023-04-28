import { RESET, atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { WritableAtom } from 'jotai';

interface PersistedAtomOptions {
  secure?: boolean | SecureStore.SecureStoreOptions;
}

export const persistedAtom = <Value>(
  key: string,
  initialValue: Value,
  { secure }: PersistedAtomOptions = {},
): WritableAtom<Value, [SetStateActionWithReset<Value>], void> => {
  const storage: AsyncStorage<unknown> = secure
    ? secure === true
      ? SECURE_STORAGE
      : getSecureStorage(secure)
    : STORAGE;

  const atom = atomWithStorage(key, initialValue, storage as unknown as AsyncStorage<Value>);
  atom.debugLabel = key;

  return atom;
};

type AsyncStorage<Value> = ReturnType<typeof createJSONStorage<Value>>;
type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

const STORAGE = createJSONStorage(() => AsyncStorage);

const getSecureStorage = (options?: SecureStore.SecureStoreOptions) =>
  createJSONStorage(() => ({
    getItem: (key) => SecureStore.getItemAsync(key, options),
    setItem: (key, newValue) => SecureStore.setItemAsync(key, newValue, options),
    removeItem: (key) => SecureStore.deleteItemAsync(key, options),
  }));

const SECURE_STORAGE = getSecureStorage();
