import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React, { ReactNode, useMemo } from 'react';
import { useCustomFields } from '../hooks/useCustomFields';
import { useAuthorization } from '../hooks/useDevice';

export interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const { apiUrl } = useCustomFields();
  const auth = useAuthorization();

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: `${apiUrl}/graphql`,
        cache: new InMemoryCache(),
        headers: {
          Authorization: auth,
        },
      }),
    [apiUrl, auth],
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
