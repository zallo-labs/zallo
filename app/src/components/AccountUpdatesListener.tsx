import { gql } from '@api';
import { useSubscription } from 'urql';

const Subscription = gql(/* GraphQL */ `
  subscription AccountUpdatesListener_Subscription {
    policyUpdated {
      id
      event
      account
      policy {
        id
      }
    }
  }
`);

export function AccountUpdatesListener() {
  useSubscription({ query: Subscription });

  return null;
}
