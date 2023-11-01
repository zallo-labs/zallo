import AsyncStorage from '@react-native-async-storage/async-storage';
import type { getSecureStore as _getSecureStore } from './index.native';
import type { SecureStoreOptions } from 'expo-secure-store';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { createCipher } from '../crypto/cipher';

export type { SecureStoreOptions };

export interface SecureStore {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// TODO: encrypt data with user password - https://linear.app/zallo/issue/Z-195/password-security
export const getSecureStore: typeof _getSecureStore = (_options) => ({
  getItem: async (key) => {
    key = namespaceKey(key);
    const encryptedValue = await AsyncStorage.getItem(key);
    if (!encryptedValue) return null;

    return (await getCipher()).decrypt(encryptedValue);
  },
  setItem: async (key, value) => {
    key = namespaceKey(key);
    const encryptedValue = await (await getCipher()).encrypt(value);
    return AsyncStorage.setItem(key, encryptedValue);
  },
  removeItem: (key) => {
    key = namespaceKey(key);
    return AsyncStorage.removeItem(key);
  },
});

const CIPHER = new BehaviorSubject<Awaited<ReturnType<typeof createCipher>> | null>(null);

export async function unlockSecureStorage(password: string | undefined) {
  CIPHER.next(await createCipher(password ?? ''));
}

export function lockSecureStorage() {
  CIPHER.next(null);
}

export function secureStorageLocked() {
  return !CIPHER.getValue();
}

function getCipher() {
  return firstValueFrom(CIPHER.pipe(filter(Boolean)));
}

const NAMESPACE = 'secret::';
function namespaceKey(key: string) {
  return key.startsWith(NAMESPACE) ? key : NAMESPACE + key;
}

export async function changeSecureStorePassword(newPassword: string) {
  const currentCipher = await getCipher();
  const newCipher = await createCipher(newPassword);

  const encryptedKeys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(NAMESPACE));

  const reEncryptedItems = (await AsyncStorage.multiGet(encryptedKeys))
    .filter((pair): pair is [string, string] => pair[1] !== null)
    .map(async ([key, currentEncrypted]): Promise<[string, string]> => {
      const decrypted = await currentCipher.decrypt(currentEncrypted);
      return [key, await newCipher.encrypt(decrypted)];
    });

  await AsyncStorage.multiSet(await Promise.all(reEncryptedItems));

  unlockSecureStorage(newPassword);
}
