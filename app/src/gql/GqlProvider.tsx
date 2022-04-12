import { createContext, useContext, useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';

import { ChildrenProps } from '@util/provider';
import { CLIENT_CONFIGS, GqlClients, isGqlClients } from './clients';

const clientsContext = createContext<GqlClients | undefined>(undefined);

export const useGqlClients = () => useContext(clientsContext!);
export const useApiClient = () => useGqlClients().api;
export const useSubgraphClient = () => useGqlClients().subgraph;
export const useUniswapClient = () => useGqlClients().uniswap;

export const GqlProvider = ({ children }: ChildrenProps) => {
  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});

  useEffect(() => {
    CLIENT_CONFIGS.forEach(async ({ name, ...options }) => {
      const cache = new InMemoryCache();

      await persistCache({
        key: name,
        cache,
        storage: AsyncStorage,
      });

      setClients((prev) => ({
        ...prev,
        [name]: new ApolloClient({
          name,
          cache,
          ...options,
        }),
      }));
    });
  }, []);

  if (!isGqlClients(clients)) return <AppLoading />;

  return <clientsContext.Provider value={clients}>{children}</clientsContext.Provider>;
};
