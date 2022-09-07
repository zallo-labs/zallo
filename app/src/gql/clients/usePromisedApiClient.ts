import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { useMemo } from 'react';
import { CONFIG } from '~/util/config';
import { DEFAULT_GQL_CLIENT_OPTIONS } from './util';
import { useAuthFlowLink } from './apiAuthFlowLink';
import { getPersistedCache } from './util';

export const API_CLIENT_NAME = 'api';
const CACHE = getPersistedCache(API_CLIENT_NAME);

export const usePromisedApiClient = () => {
  const authFlowLink = useAuthFlowLink();

  return useMemo(
    async () =>
      new ApolloClient({
        name: API_CLIENT_NAME,
        cache: await CACHE,
        link: ApolloLink.from([
          new RetryLink(),
          authFlowLink,
          new HttpLink({
            uri: `${CONFIG.apiUrl}/graphql`,
            credentials: 'include',
          }),
        ]),
        defaultOptions: DEFAULT_GQL_CLIENT_OPTIONS,
      }),
    [authFlowLink],
  );
};
