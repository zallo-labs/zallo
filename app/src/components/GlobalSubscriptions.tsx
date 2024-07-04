import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

const AccountUpdated = graphql`
  subscription GlobalSubscriptions_AccountUpdatedSubscription {
    accountUpdated {
      id
      event
      account {
        id
      }
    }
  }
`;

const PolicyUpdated = graphql`
  subscription GlobalSubscriptions_PolicyUpdatedSubscription {
    policyUpdated {
      id
      event
      account
      policy {
        id
      }
    }
  }
`;

const ProposalUpdated = graphql`
  subscription GlobalSubscriptions_ProposalUpdatedSubscription {
    proposalUpdated {
      id
      event
      account
      proposal {
        id
      }
    }
  }
`;

const Transfer = graphql`
  subscription GlobalSubscriptions_TransferSubscriptionSubscription {
    transfer {
      id
      account {
        id
      }
    }
  }
`;

export function GlobalSubscriptions() {
  // useSubscription(useMemo(() => ({ subscription: AccountUpdated, variables: {} }), []));
  // useSubscription(useMemo(() => ({ subscription: PolicyUpdated, variables: {} }), []));
  // useSubscription(useMemo(() => ({ subscription: ProposalUpdated, variables: {} }), []));
  // useSubscription(useMemo(() => ({ subscription: Transfer, variables: {} }), []));

  return null;
}
