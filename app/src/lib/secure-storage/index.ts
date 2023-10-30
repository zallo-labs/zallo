import AsyncStorage from '@react-native-async-storage/async-storage';
import type { getSecureStore as _getSecureStore } from './index.native';
import type { SecureStoreOptions } from 'expo-secure-store';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';

export type { SecureStoreOptions };

export interface SecureStore {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// TODO: encrypt data with user password - https://linear.app/zallo/issue/Z-195/password-security
export const getSecureStore: typeof _getSecureStore = (options) => ({
  getItem: async (key) => {
    const [encryptedValue, password] = await Promise.all([
      AsyncStorage.getItem(key),
      getPassword(),
    ]);
    if (!encryptedValue) return null;

    return decrypt(encryptedValue, password);
  },
  setItem: async (key, value) => {
    const encryptedValue = await encrypt(value, await getPassword());
    return AsyncStorage.setItem(key, encryptedValue);
  },
  removeItem: (key) => AsyncStorage.removeItem(key),
});

const PASSWORD = new BehaviorSubject<string | null>(null);

export function unlockSecureStorage(password: string) {
  console.log('UNLOCKED');
  PASSWORD.next(password);
}

export function lockSecureStorage() {
  PASSWORD.next(null);
}

function getPassword() {
  return firstValueFrom(PASSWORD.pipe(filter(Boolean)));
}

async function encrypt(value: string, password: string | null): Promise<string> {
  // TODO:

  return value;
}

async function decrypt(encrypted: string, password: string | null): Promise<string> {
  // TODO:

  return encrypted;
}
