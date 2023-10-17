import AsyncStorage from '@react-native-async-storage/async-storage';
import type { getSecureStore as _getSecureStore } from './index.native';
import type { SecureStoreOptions } from 'expo-secure-store';

export type { SecureStoreOptions };

export interface SecureStore {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// TODO: encrypt data with user password - https://linear.app/zallo/issue/Z-195/password-security
export const getSecureStore: typeof _getSecureStore = (options) => ({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});
