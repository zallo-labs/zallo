import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

import { ChildrenProps } from '@util/children';
import {
  API_CLIENT_NAME,
  ClientCreator,
  createSubgraphClient,
  createUniswapClient,
  SUBGRAPH_CLIENT_NAME,
  UNISWAP_CLIENT_NAME,
  useCreateApiClient,
} from './clients';
import { Suspend } from '@components/Suspender';

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
  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});

  const create = async (name: Name, creator: ClientCreator) => {
    const client = await creator();
    setClients((clients) => ({ ...clients, [name]: client }));
  };

  useEffect(() => {
    create(SUBGRAPH_CLIENT_NAME, createSubgraphClient);
    create(UNISWAP_CLIENT_NAME, createUniswapClient);
  }, []);

  const createApiClient = useCreateApiClient();
  useEffect(() => {
    create(API_CLIENT_NAME, createApiClient);
  }, [createApiClient]);

  if (!isGqlClients(clients)) return <Suspend />;

  return <context.Provider value={clients}>{children}</context.Provider>;
};
