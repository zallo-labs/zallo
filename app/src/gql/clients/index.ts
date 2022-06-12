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
import { useCallback } from 'react';

export { gql as apiGql, gql as subGql, gql as uniswapGql };

// https://www.apollographql.com/docs/react/data/queries/#supported-fetch-policies
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
  },
  // query: {
  //   fetchPolicy: 'cache-first',
  // },
};

export const API_CLIENT_NAME = 'api';
export const useCreateApiClient = () => {
  const wallet = useWallet();

  return useCallback(
    async () =>
      new ApolloClient({
        name: API_CLIENT_NAME,
        cache: await getPersistedCache(API_CLIENT_NAME),
        link: ApolloLink.from([
          new RetryLink(),
          createAuthFlowLink(wallet),
          new HttpLink({ uri: CONFIG.api.gqlUrl }),
        ]),
        defaultOptions,
      }),
    [wallet],
  );
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
