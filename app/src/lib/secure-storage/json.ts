import { createJSONStorage } from 'jotai/utils';
import { SecureStoreOptions, getSecureStore } from './index';

export const secureJsonStorage = <V>(options?: SecureStoreOptions) =>
  createJSONStorage<V>(() => getSecureStore(options));
