import { DefaultOptions, InMemoryCache } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageWrapper, persistCache } from 'apollo3-cache-persist';

// https://www.apollographql.com/docs/react/data/queries/#supported-fetch-policies
export const DEFAULT_GQL_CLIENT_OPTIONS: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
};

const storage = new AsyncStorageWrapper(AsyncStorage);

export const getPersistedCache = async (clientName: string) => {
  const cache = new InMemoryCache();

  await persistCache({ key: clientName, cache, storage });

  return cache;
};
