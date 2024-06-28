import { gql } from '@api';
import { useSubscription } from 'urql';

const AccountUpdated = gql(/* GraphQL */ `
  subscription GlobalSubscriptions_AccountUpdated {
    accountUpdated {
      id
      event
      account {
        id
      }
    }
  }
`);

const PolicyUpdated = gql(/* GraphQL */ `
  subscription AccountUpdatesListener_PolicyUpdated {
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

const ProposalUpdated = gql(/* GraphQL */ `
  subscription AccountUpdatesListener_ProposalUpdated {
    proposalUpdated {
      id
      event
      account
      proposal {
        id
      }
    }
  }
`);

const Transfer = gql(/* GraphQL */ `
  subscription AccountUpdatesListener_TransferSubscription {
    transfer {
      id
      account {
        id
      }
    }
  }
`);

export function GlobalSubscriptions() {
  useSubscription({ query: AccountUpdated });
  useSubscription({ query: PolicyUpdated });
  useSubscription({ query: ProposalUpdated });
  useSubscription({ query: Transfer });

  return null;
}
