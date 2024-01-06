import { createJSONStorage } from 'jotai/utils';

import { getSecureStore, SecureStoreOptions } from './index';

export const secureJsonStorage = <V>(options?: SecureStoreOptions) =>
  createJSONStorage<V>(() => getSecureStore(options));
