import * as Store from 'expo-secure-store';
import { GetSecureStore, SecureStore } from './types';
import { logError } from '../analytics';

export const getSecureStore: GetSecureStore = (options) => ({
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
