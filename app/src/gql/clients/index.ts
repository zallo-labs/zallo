import { ApolloClient, ApolloLink, gql, HttpLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

import { CONFIG } from '~/config';
import { useWallet } from '@features/wallet/WalletProvider';
import { createAuthFlowLink } from './apiAuthFlowLink';
import { getPersistedCache } from './cache';
import { Duration } from 'luxon';

export { gql as apiGql, gql as sgGql, gql as uniswapGql };

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
    });
};

export const SUBGRAPH_CLIENT_NAME = 'subgraph';
export const createSubgraphClient = async () =>
  new ApolloClient({
    name: SUBGRAPH_CLIENT_NAME,
    cache: await getPersistedCache(SUBGRAPH_CLIENT_NAME),
    link: ApolloLink.from([new RetryLink(), new HttpLink({ uri: CONFIG.subgraphGqlUrl })]),
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
      query: {
        pollInterval: Duration.fromObject({ seconds: 5 }).toMillis(),
      },
    },
  });
