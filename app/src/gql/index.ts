import { ApolloClient, InMemoryCache } from '@apollo/client';
import { CONFIG } from '../config';

export * from './users.gql';

export const APOLLO_CLIENT = new ApolloClient({
  uri: CONFIG.api.gqlUrl,
  cache: new InMemoryCache(),
});
