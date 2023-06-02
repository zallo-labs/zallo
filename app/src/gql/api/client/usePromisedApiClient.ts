import { ApolloClient, ApolloLink, HttpLink, split } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { useMemo } from 'react';
import { CONFIG } from '~/util/config';
import { useApiAuth } from './useApiAuth';
import { getPersistedCache, DEFAULT_GQL_CLIENT_OPTIONS } from '~/gql/util';
import { createHash } from 'crypto';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { logError } from '~/util/analytics';
import _ from 'lodash';

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

const errorLink = onError(({ forward, operation, graphQLErrors, networkError }) => {
  logError('API error', {
    error: networkError,
    graphQLErrors,
    operation: _.pick(operation, ['operationName', 'variables']),
  });

  return forward(operation);
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
          errorLink,
          auth.link,
          splitLinks({
            other: ApolloLink.from([
              persistedQueryLink,
              new HttpLink({
                uri: `${CONFIG.apiUrl}/graphql`,
                credentials: 'include', // TODO: try remove; RN cookies are problematic - https://github.com/facebook/react-native/issues/23185
              }),
            ]),
            subscriptions: new GraphQLWsLink(
              createClient({
                url: CONFIG.apiGqlWs,
                connectionParams: () => auth.getHeaders() as unknown as Record<string, unknown>,
                lazy: true,
                retryAttempts: 10,
              }),
            ),
          }),
        ]),
      }),
    [auth],
  );
};
