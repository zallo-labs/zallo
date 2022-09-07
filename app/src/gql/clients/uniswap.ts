import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { DEFAULT_GQL_CLIENT_OPTIONS, getPersistedCache } from './util';

export const UNISWAP_CLIENT_NAME = 'uniswap';
export const UNISWAP_CLIENT = (async () =>
  new ApolloClient({
    name: UNISWAP_CLIENT_NAME,
    cache: await getPersistedCache(UNISWAP_CLIENT_NAME),
    link: ApolloLink.from([
      new RetryLink(),
      new HttpLink({
        uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      }),
    ]),
    defaultOptions: DEFAULT_GQL_CLIENT_OPTIONS,
  }))();
