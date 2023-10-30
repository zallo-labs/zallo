import * as Store from 'expo-secure-store';
import { logError } from '~/util/analytics';
import type { SecureStore, SecureStoreOptions } from './index';

export const getSecureStore = (options?: SecureStoreOptions): SecureStore => ({
  getItem: async (key) => {
    try {
      return await Store.getItemAsync(key, options);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message !== 'Could not encrypt/decrypt the value for SecureStore'
      ) {
        logError(`SecureStore.getItemAsync error: ${e.message}`, { error: e, key });
      }

      return null;
    }
  },
  setItem: (key, value) => Store.setItemAsync(key, value, options),
  removeItem: (key) => Store.deleteItemAsync(key, options),
});

export function unlockSecureStorage(_password: string) {}

export function lockSecureStorage() {}

export function secureStorageLocked() {
  return false;
}

export function changeSecureStorePassword(_newPassword: string) {}
