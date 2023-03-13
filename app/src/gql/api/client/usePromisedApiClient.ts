import { ApolloClient, ApolloLink, HttpLink, split } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { useMemo } from 'react';
import { CONFIG } from '~/util/config';
import { useApiAuth } from './useApiAuth';
import { getPersistedCache, DEFAULT_GQL_CLIENT_OPTIONS } from '~/gql/util';
import OfflineLink from 'apollo-link-offline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHash } from 'crypto';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

export const API_CLIENT_NAME = 'api';
const CACHE = getPersistedCache(API_CLIENT_NAME);

const splitLinks = ({ other, subscriptions }: { other: ApolloLink; subscriptions: ApolloLink }) =>
  split(
    ({ query }) => {
      // Use WS transport only for subscriptions
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    subscriptions,
    other,
  );

const persistedQueryLink = createPersistedQueryLink({
  sha256: (...args: unknown[]) => createHash('sha256').update(args.join('')).digest('hex'),
  useGETForHashedQueries: true,
});

export const usePromisedApiClient = () => {
  const auth = useApiAuth();

  return useMemo(
    async () =>
      new ApolloClient({
        name: API_CLIENT_NAME,
        cache: await CACHE,
        defaultOptions: DEFAULT_GQL_CLIENT_OPTIONS,
        queryDeduplication: true,
        link: ApolloLink.from([
          // new OfflineLink({ storage: AsyncStorage }),  // Breaks optimistic updates
          new RetryLink(),
          splitLinks({
            other: ApolloLink.from([
              auth.link,
              persistedQueryLink,
              new HttpLink({
                uri: `${CONFIG.apiUrl}/graphql`,
                credentials: 'include',
              }),
            ]),
            subscriptions: new GraphQLWsLink(
              createClient({
                url: CONFIG.apiGqlWs,
                connectionParams: () => auth.getHeaders() as unknown as Record<string, unknown>,
                lazy: true,
              }),
            ),
          }),
        ]),
      }),
    [auth],
  );
};
