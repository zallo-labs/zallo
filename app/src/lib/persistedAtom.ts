import type { AsyncStorage as TAsyncStorage } from 'jotai/vanilla/utils/atomWithStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom, Getter, WritableAtom } from 'jotai';
import { createJSONStorage, RESET } from 'jotai/utils';

export type PersistedAtomOptions<V, U extends AnyJson> = StorageOptions<V, U> & {
  persistInitial?: boolean;
  migrate?: (v: unknown) => V | undefined;
};

// Based off https://github.com/pmndrs/jotai/blob/main/src/vanilla/utils/atomWithStorage.ts
// Primary difference is that this persists the initialValue
export const persistedAtom = <
  V extends string | number | boolean | object | null,
  U extends AnyJson = AnyJson,
>(
  key: string,
  initializer: V | (() => V),
  { persistInitial, migrate, ...storageOptions }: PersistedAtomOptions<V, U> = {},
) => {
  const initialValue: V = typeof initializer === 'function' ? initializer() : initializer;

  const storage = getStorage(storageOptions);
  const getPersisted = () => storage.getItem(key, initialValue);
  const setPersisted = (value: V) => storage.setItem(key, value);

  const initialPersistedValue = (async () => {
    const initial = await getPersisted();
    if (!migrate) return initial;

    const migrated = migrate(initial);
    return migrated !== undefined ? migrated : initial;
  })();

  const baseAtom = atom(initialValue);
  baseAtom.debugLabel = `${key}::base`;

  let initialized = false;
  baseAtom.onMount = (setAtom) => {
    if (!initialized) {
      /* Initialization */
      initialPersistedValue.then((v) => {
        if (v === initialValue && persistInitial) {
          storage.setItem(key, initialValue);
        } else if (v !== initialValue) {
          setAtom(v);
        }
        initialized = true;
      });
    } else {
      /* Previously initialized */
      // Storage value may have been changed (externally) after unmount thereby not being picked up by the subscription
      storage.getItem(key, initialValue).then((newValue) => setAtom(newValue));
    }

    const unsubscribe = storage.subscribe?.(key, setAtom, initialValue);

    return () => {
      unsubscribe?.();
    };
  };

  const getUninitializedValue = async (get: Getter) => {
    get(baseAtom); // Trigger onMount
    return initialPersistedValue;
  };

  const pAtom = atom(
    (get) => (initialized ? get(baseAtom) : (getUninitializedValue(get) as V)), // Actually V | Promise<V> but that's not allowed by jotai-immer and it will return V after mount anyway
    (get, set, update: SetStateActionWithReset<V>) => {
      const nextValue =
        typeof update === 'function'
          ? (update as (prev: V) => V | typeof RESET)(get(baseAtom))
          : update;

      const newValue = nextValue === RESET ? initialValue : nextValue;

      set(baseAtom, newValue);
      storage.setItem(key, newValue);
    },
  ) as WritableAtom<V, [SetStateActionWithReset<V>], void> & {
    getPersisted: () => PromiseLike<V>;
    setPersited: (v: V) => void;
  };
  pAtom.debugLabel = key;
  pAtom.getPersisted = getPersisted;
  pAtom.setPersited = setPersisted;

  return pAtom;
};

export type StorageOptions<V, U extends AnyJson> = {
  storage?: TAsyncStorage<U | undefined>;
} & (
  | {
      stringifiy: (value: V) => U;
      parse: (value: U) => V;
    }
  | {
      stringifiy?: never;
      parse?: never;
    }
);

const ASYNC_STORAGE = createJSONStorage(() => AsyncStorage);

const getStorage = <V, U extends AnyJson>({
  storage,
  parse,
  stringifiy,
}: StorageOptions<V, U> = {}): TAsyncStorage<V> => {
  const store = storage ?? (ASYNC_STORAGE as TAsyncStorage<U | undefined>);

  const getItem: TAsyncStorage<V>['getItem'] = parse
    ? async (key, initialValue) => {
        const r = await store.getItem(key, undefined);
        return r === undefined ? initialValue : parse(r);
      }
    : (store.getItem as unknown as TAsyncStorage<V>['getItem']);

  const setItem: TAsyncStorage<V>['setItem'] = stringifiy
    ? async (key, newValue) => store.setItem(key, stringifiy(newValue))
    : (store.setItem as unknown as TAsyncStorage<V>['setItem']);

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
