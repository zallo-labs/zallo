import { createContext, useContext, useState } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

import { ChildrenProps } from '@util/children';
import {
  API_CLIENT_NAME,
  createSubgraphClient,
  createUniswapClient,
  SUBGRAPH_CLIENT_NAME,
  UNISWAP_CLIENT_NAME,
  useCreateApiClient,
} from './clients';
import { Suspend } from '@components/Suspender';
import useAsyncEffect from 'use-async-effect';
import { mapAsync } from 'lib';

const clientNames = [
  API_CLIENT_NAME,
  SUBGRAPH_CLIENT_NAME,
  UNISWAP_CLIENT_NAME,
] as const;
type Name = typeof clientNames[number];

type GqlClients = Record<Name, ApolloClient<NormalizedCacheObject>>;

export const isGqlClients = (
  clients: GqlClients | Partial<GqlClients>,
): clients is GqlClients =>
  clientNames.every((name) => clients[name] !== undefined);

const context = createContext<GqlClients | undefined>(undefined);

const useGqlClients = () => useContext(context!);
export const useApiClient = () => useGqlClients().api;
export const useSubgraphClient = () => useGqlClients().subgraph;
export const useUniswapClient = () => useGqlClients().uniswap;

export const GqlProvider = ({ children }: ChildrenProps) => {
  const createApiClient = useCreateApiClient();

  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});
  useAsyncEffect(async () => {
    const newClients = await mapAsync(
      [
        [API_CLIENT_NAME, createApiClient],
        [SUBGRAPH_CLIENT_NAME, createSubgraphClient],
        [UNISWAP_CLIENT_NAME, createUniswapClient],
      ],
      async ([name, create]: [
        string,
        () => Promise<ApolloClient<NormalizedCacheObject>>,
      ]): Promise<[string, ApolloClient<NormalizedCacheObject>]> => [
        name,
        await create(),
      ],
    );

    setClients(Object.fromEntries(newClients));
  }, [createApiClient]);

  if (!isGqlClients(clients)) return <Suspend />;

  return <context.Provider value={clients}>{children}</context.Provider>;
};
