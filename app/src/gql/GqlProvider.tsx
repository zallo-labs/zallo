import { createContext, useContext, useEffect, useState } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import AppLoading from 'expo-app-loading';

import { ChildrenProps } from '@util/provider';
import {
  API_CLIENT_NAME,
  createSubgraphClient,
  createUniswapClient,
  SUBGRAPH_CLIENT_NAME,
  UNISWAP_CLIENT_NAME,
  useCreateApiClient,
} from './clients';

const clientNames = [API_CLIENT_NAME, SUBGRAPH_CLIENT_NAME, UNISWAP_CLIENT_NAME] as const;
type Name = typeof clientNames[number];

type GqlClients = Record<Name, ApolloClient<NormalizedCacheObject>>;

export const isGqlClients = (clients: GqlClients | Partial<GqlClients>): clients is GqlClients =>
  clientNames.every((name) => clients[name] !== undefined);

const context = createContext<GqlClients | undefined>(undefined);

const useGqlClients = () => useContext(context!);
export const useApiClient = () => useGqlClients().api;
export const useSubgraphClient = () => useGqlClients().subgraph;
export const useUniswapClient = () => useGqlClients().uniswap;

export const GqlProvider = ({ children }: ChildrenProps) => {
  const createApiClient = useCreateApiClient();

  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});
  useEffect(() => {
    (
      [
        [API_CLIENT_NAME, createApiClient],
        [SUBGRAPH_CLIENT_NAME, createSubgraphClient],
        [UNISWAP_CLIENT_NAME, createUniswapClient],
      ] as const
    ).forEach(async ([name, createClient]) => {
      const client = await createClient();

      setClients((clients) => ({
        ...clients,
        [name]: client,
      }));
    });
  }, []);

  if (!isGqlClients(clients)) return <AppLoading />;

  return <context.Provider value={clients}>{children}</context.Provider>;
};
