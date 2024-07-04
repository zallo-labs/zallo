import { useCallback } from 'react';
import { useMutation } from '~/api';
import { graphql } from 'relay-runtime';
import {
  ProposeTransactionInput,
  useProposeTransactionMutation,
} from '~/api/__generated__/useProposeTransactionMutation.graphql';

// graphql`
//   fragment useProposeTransaction_assignable_proposal on Proposal @assignable {
//     __typename
//   }
// `;

// const Account = graphql`
//   fragment useProposeTransaction_account on Account {
//     proposals {
//       ...useProposeTransaction_assignable_proposal
//     }
//   }
// `;

const Propose = graphql`
  mutation useProposeTransactionMutation($input: ProposeTransactionInput!) {
    proposeTransaction(input: $input) {
      id
      account {
        id
      }
    }
  }
`;

export interface UseProposeTransactionMutationParams {
  // query: useProposeTransaction_account$key;
}

export function useProposeTransaction() {
  const propose = useMutation<useProposeTransactionMutation>(Propose, {
    updater: (store, data) => {
      const t = data?.proposeTransaction;
      if (!t) return;

      // Prepend to Account.proposals
      const account = store.get(t.account.id);
      const transaction = store.get(t.id);
      if (account && transaction) {
        const proposals = account.getLinkedRecords('proposals');
        account.setLinkedRecords([transaction, ...(proposals ?? [])], 'proposals');
      }
    },
  });

  return useCallback(
    async (input: ProposeTransactionInput) => {
      const r = await propose({ input });

      return r.proposeTransaction.id;
    },
    [propose],
  );
}
