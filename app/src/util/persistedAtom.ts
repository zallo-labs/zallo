import { WritableAtom } from 'jotai';
import { RESET, atomWithStorage, createJSONStorage, unstable_NO_STORAGE_VALUE } from 'jotai/utils';
import type { AsyncStorage as AsyncStorageType } from 'jotai/vanilla/utils/atomWithStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const persistedAtom = <V, U extends AnyJson = AnyJson>(
  key: string,
  initialValue: V,
  options?: StorageOptions<V, U>,
): WritableAtom<V, [SetStateActionWithReset<V>], void> => {
  const storage = create(options);

  const atom = atomWithStorage(key, initialValue, storage);
  atom.debugLabel = key;

  return atom;
};

type StorageOptions<V, U extends AnyJson> = {
  secure?: SecureStore.SecureStoreOptions;
  stringifiy?: (value: V) => U;
  parse?: (value: U) => V;
};

const create = <V, U extends AnyJson>({
  secure: secure,
  parse,
  stringifiy,
}: StorageOptions<V, U> = {}): AsyncStorageType<V> => {
  const store = createJSONStorage<U>(() =>
    secure
      ? {
          getItem: (key) => SecureStore.getItemAsync(key, secure),
          setItem: (key, newValue) => SecureStore.setItemAsync(key, newValue, secure),
          removeItem: (key) => SecureStore.deleteItemAsync(key, secure),
        }
      : AsyncStorage,
  );

  const getItem: AsyncStorageType<V>['getItem'] = parse
    ? async (key) => {
        const r = await store.getItem(key);
        return r === unstable_NO_STORAGE_VALUE ? unstable_NO_STORAGE_VALUE : parse(r);
      }
    : (store.getItem as AsyncStorageType<V>['getItem']);

  const setItem: AsyncStorageType<V>['setItem'] = stringifiy
    ? async (key, newValue) => store.setItem(key, stringifiy(newValue))
    : (store.setItem as unknown as AsyncStorageType<V>['setItem']);

  return {
    getItem,
    setItem,
    removeItem: (key) => store.removeItem(key),
  };
};

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {
  [key: string]: AnyJson;
}
interface JsonArray extends Array<AnyJson> {}
