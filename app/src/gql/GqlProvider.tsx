import { createContext, ReactNode, useContext, useState } from 'react';
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { Suspend } from '~/components/Suspender';
import useAsyncEffect from 'use-async-effect';
import { API_CLIENT_NAME, usePromisedApiClient } from '@api/client';
import { Provider as UrqlProvider } from 'urql';
import { useUrqlApiClient } from '@api/client/client';

const clientNames = [API_CLIENT_NAME] as const;
type Name = (typeof clientNames)[number];

type GqlClients = Record<Name, ApolloClient<NormalizedCacheObject>>;

export const isGqlClients = (clients: GqlClients | Partial<GqlClients>): clients is GqlClients =>
  clientNames.every((name) => clients[name] !== undefined);

const context = createContext<GqlClients | undefined>(undefined);

const useGqlClients = () => useContext(context)!;
export const useApiClient = () => useGqlClients().api;

export interface GqlProviderProps {
  children: ReactNode;
}

export const GqlProvider = ({ children }: GqlProviderProps) => {
  const urqlApiClient = useUrqlApiClient();

  const [clients, setClients] = useState<GqlClients | Partial<GqlClients>>({});

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
    <UrqlProvider value={urqlApiClient}>
      <ApolloProvider client={clients.api}>
        <context.Provider value={clients}>{children}</context.Provider>
      </ApolloProvider>
    </UrqlProvider>
  );
};
