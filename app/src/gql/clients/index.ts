import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  gql,
  HttpLink,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { Duration } from 'luxon';

import { CONFIG } from '~/config';
import { useWallet } from '@features/wallet/useWallet';
import { createAuthFlowLink } from './apiAuthFlowLink';
import { getPersistedCache } from './cache';

export { gql as apiGql, gql as subGql, gql as uniswapGql };

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
  },
};

export const API_CLIENT_NAME = 'api';
export const useCreateApiClient = () => {
  const wallet = useWallet();

  return async () =>
    new ApolloClient({
      name: API_CLIENT_NAME,
      cache: await getPersistedCache(API_CLIENT_NAME),
      link: ApolloLink.from([
        new RetryLink(),
        createAuthFlowLink(wallet),
        new HttpLink({ uri: CONFIG.api.gqlUrl }),
      ]),
      defaultOptions,
    });
};

export const SUBGRAPH_CLIENT_NAME = 'subgraph';
export const createSubgraphClient = async () =>
  new ApolloClient({
    name: SUBGRAPH_CLIENT_NAME,
    cache: await getPersistedCache(SUBGRAPH_CLIENT_NAME),
    link: ApolloLink.from([
      new RetryLink(),
      new HttpLink({ uri: CONFIG.subgraphGqlUrl }),
    ]),
    defaultOptions,
  });

export const UNISWAP_CLIENT_NAME = 'uniswap';
export const createUniswapClient = async () =>
  new ApolloClient({
    name: UNISWAP_CLIENT_NAME,
    cache: await getPersistedCache(UNISWAP_CLIENT_NAME),
    link: ApolloLink.from([
      new RetryLink(),
      new HttpLink({
        uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
      }),
    ]),
    defaultOptions: {
      ...defaultOptions,
      watchQuery: {
        ...defaultOptions.watchQuery,
        pollInterval: Duration.fromObject({ seconds: 15 }).toMillis(),
      },
    },
  });
