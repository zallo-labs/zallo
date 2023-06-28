import { createContext, ReactNode, useContext, useState } from 'react';
import { ApolloClient, ApolloProvider, NormalizedCacheObject, SuspenseCache } from '@apollo/client';
import { Suspend } from '~/components/Suspender';
import useAsyncEffect from 'use-async-effect';
import { API_CLIENT_NAME, usePromisedApiClient } from '@api/client';
import { UNISWAP_CLIENT, UNISWAP_CLIENT_NAME } from '@uniswap/client';

const clientNames = [API_CLIENT_NAME, UNISWAP_CLIENT_NAME] as const;
type Name = (typeof clientNames)[number];

type GqlClients = Record<Name, ApolloClient<NormalizedCacheObject>>;

export const isGqlClients = (clients: GqlClients | Partial<GqlClients>): clients is GqlClients =>
  clientNames.every((name) => clients[name] !== undefined);

const context = createContext<GqlClients | undefined>(undefined);

const useGqlClients = () => useContext(context)!;
export const useApiClient = () => useGqlClients().api;
export const useUniswapClient = () => useGqlClients().uniswap;

const suspenseCache = new SuspenseCache();

export interface GqlProviderProps {
  children: ReactNode;
}

export const GqlProvider = ({ children }: GqlProviderProps) => {
  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});

  useAsyncEffect(async (isMounted) => {
    const uniswap = await UNISWAP_CLIENT;

    if (isMounted()) {
      setClients((clients) => ({
        ...clients,
        uniswap,
      }));
    }
  }, []);

  const promisedApi = usePromisedApiClient();
  useAsyncEffect(
    async (isMounted) => {
      const api = await promisedApi;
      if (isMounted()) {
        setClients((clients) => ({
          ...clients,
          api,
        }));
      }
    },
    [promisedApi],
  );

  if (!isGqlClients(clients)) return <Suspend />;

  return (
    <ApolloProvider client={clients.api} suspenseCache={suspenseCache}>
      <context.Provider value={clients}>{children}</context.Provider>
    </ApolloProvider>
  );
};
