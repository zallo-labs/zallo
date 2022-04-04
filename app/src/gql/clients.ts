import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import apiConfig from '../../apollo.api.config';
import sgConfig from '../../apollo.sg.config';

export const API_CLIENT = new ApolloClient({
  name: apiConfig.client.service.name,
  uri: apiConfig.client.service.url,
  cache: new InMemoryCache(),
});

export const SG_CLIENT = new ApolloClient({
  name: sgConfig.client.service.name,
  uri: sgConfig.client.service.url,
  cache: new InMemoryCache(),
});

export { gql as apiGql, gql as sgGql };
