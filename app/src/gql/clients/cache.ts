import { InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';

export const getPersistedCache = async (clientName: string) => {
  const cache = new InMemoryCache();

  await persistCache({
    key: clientName,
    cache,
    storage: AsyncStorage,
  });

  return cache;
};
