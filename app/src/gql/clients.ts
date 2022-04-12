import { ApolloClient, ApolloClientOptions, gql, NormalizedCacheObject } from '@apollo/client';

import { CONFIG } from '~/config';

export { gql as apiGql, gql as sgGql, gql as uniswapGql };

const names = ['api', 'subgraph', 'uniswap'] as const;
type Name = typeof names[number];

export type ClientConfig = Omit<ApolloClientOptions<NormalizedCacheObject>, 'cache'>;

const configsMap: Record<Name, ClientConfig> = {
  api: {
    uri: CONFIG.api.gqlUrl,
  },
  subgraph: {
    uri: CONFIG.subgraphGqlUrl,
  },
  uniswap: {
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph',
  },
} as const;

export const CLIENT_CONFIGS: ClientConfig[] = Object.entries(configsMap).map(([name, config]) => ({
  name,
  ...config,
}));

export type GqlClients = Record<Name, ApolloClient<NormalizedCacheObject>>;

export const isGqlClients = (clients: GqlClients | Partial<GqlClients>): clients is GqlClients =>
  names.every((name) => clients[name] !== undefined);
