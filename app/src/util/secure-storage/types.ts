import type { SecureStoreOptions } from 'expo-secure-store';

export type { SecureStoreOptions };

export type GetSecureStore = (options?: SecureStoreOptions) => SecureStore;

export interface SecureStore {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}
