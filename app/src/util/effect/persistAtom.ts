import AsyncStorage from '@react-native-async-storage/async-storage';
import { AtomEffect, DefaultValue } from 'recoil';
import * as SecureStore from 'expo-secure-store';
import BigIntJSON from '../BigIntJSON';

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

type Migrations = Record<number, (value: string) => string | DefaultValue>;

const migrate = (
  atomKey: string,
  data: string | DefaultValue,
  dataVersion: number,
  migrations: Migrations,
  currentVersion: number,
): string | DefaultValue => {
  if (dataVersion === currentVersion || data instanceof DefaultValue) return data;

  const migration = migrations[dataVersion];
  if (!migration) throw new Error(`Atom '${atomKey}' has no migration for version ${dataVersion}`);

  return migrate(atomKey, migration(data), dataVersion + 1, migrations, currentVersion);
};

export type PersistAtomOptions<T> = {
  stringify?: Save<T>;
  parse?: Load<T>;
  storage?: Storage;
  saveIf?: (value: T, isDefault: boolean) => boolean;
  clear?: boolean;
} & ({ version?: never; migrations?: never } | { version: number; migrations: Migrations });

export const persistAtom =
  <T>({
    stringify = JSON.stringify,
    parse = JSON.parse,
    storage = AsyncStorage,
    saveIf,
    version = 0,
    migrations = {},
    clear,
  }: PersistAtomOptions<T> = {}): AtomEffect<T> =>
  ({ setSelf, onSet, node: { key } }) => {
    // Loads the saved value, otherwise uses the default value
    setSelf(
      storage.getItem(key).then((wrapped) => {
        if (clear) {
          storage.removeItem(key);
          return new DefaultValue();
        }
        if (wrapped === null || clear) return new DefaultValue();

        let { data, version: dataVersion }: Wrapped = JSON.parse(wrapped);
        if (dataVersion !== version) {
          const migrated = migrate(key, data, dataVersion, migrations, version);
          if (migrated instanceof DefaultValue) return migrated;
          data = migrated;
        }

        return parse(data ?? null);
      }),
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _oldValue, isReset) => {
      if (!saveIf || saveIf(newValue, isReset)) {
        const wrapped: Wrapped = { data: stringify(newValue) ?? null, version };

        storage.setItem(key, JSON.stringify(wrapped));
      } else {
        storage.removeItem(key);
      }
    });
  };
