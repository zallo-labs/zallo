import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { CONFIG } from '~/util/config';
import { DEFAULT_GQL_CLIENT_OPTIONS, getPersistedCache } from '../util/client';

export const SUBGRAPH_CLIENT_NAME = 'subgraph';
export const SUBGRAPH_CLIENT = (async () =>
  new ApolloClient({
    name: SUBGRAPH_CLIENT_NAME,
    cache: await getPersistedCache(SUBGRAPH_CLIENT_NAME),
    link: ApolloLink.from([new RetryLink(), new HttpLink({ uri: CONFIG.subgraphGqlUrl })]),
    defaultOptions: DEFAULT_GQL_CLIENT_OPTIONS,
  }))();
