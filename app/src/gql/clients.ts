import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { CONFIG } from '~/config';

export const API_CLIENT = new ApolloClient({
  name: 'api',
  uri: CONFIG.api.gqlUrl,
  cache: new InMemoryCache(),
});

export const SG_CLIENT = new ApolloClient({
  name: 'subgraph',
  uri: CONFIG.subgraphGqlUrl,
  cache: new InMemoryCache(),
});

export const UNISWAP_CLIENT = new ApolloClient({
  name: 'uniswap',
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
  cache: new InMemoryCache(),
});

export { gql as apiGql, gql as sgGql, gql as uniswapGql };
