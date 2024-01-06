import { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';

import { ZERO_ADDR } from 'lib';
import {
  FirstPendingProposalQuery,
  FirstPendingProposalQueryVariables,
  ProposeTestMutation,
  ProposeTestMutationVariables,
} from '../api.generated';
import { useDevice } from '../hooks/useDevice';
import { useAccount } from './useAccount';
import { useSuspenseQuery } from './useSuspenseQuery';

const useFirstPendingProposal = (account: string): string | undefined =>
  useSuspenseQuery<FirstPendingProposalQuery, FirstPendingProposalQueryVariables>(
    gql`
      query FirstPendingProposal($input: ProposalsInput) {
        proposals(input: $input) {
          id
          hash
        }
      }
    `,
    {
      variables: {
        input: {
          accounts: [account],
          pending: true,
        },
      },
    },
  ).data.proposals[0]?.hash;

const usePropose = () =>
  useMutation<ProposeTestMutation, ProposeTestMutationVariables>(gql`
    mutation ProposeTest($input: ProposeTransactionInput!) {
      proposeTransaction(input: $input) {
        id
        hash
      }
    }
  `)[0];

export const useProposal = () => {
  // Query for a pending proposal
  const account = useAccount() || ZERO_ADDR;
  const firstProposal = useFirstPendingProposal(account);
  const propose = usePropose();
  const device = useDevice();

  // Create a new proposal if one doesn't exist
  const [proposal, setProposal] = useState<string | undefined>(firstProposal);
  useEffect(() => {
    (async () => {
      if (!proposal && account !== ZERO_ADDR) {
        const { data } = await propose({
          variables: {
            input: { account, operations: [{ to: device.address, value: 15000 }] },
          },
        });
        setProposal(data?.proposeTransaction.hash);
      }
    })();
  }, [account, device.address, proposal, propose]);

  return proposal;
};
