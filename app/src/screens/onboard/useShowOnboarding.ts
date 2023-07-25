import { gql } from '@api/generated';
import { useQuery } from '~/gql';

const Query = gql(/* GraphQL */ `
  query UseShowOnboarding {
    accounts {
      id
    }
  }
`);

export const useShowOnboarding = () => useQuery(Query).data.accounts.length === 0;
