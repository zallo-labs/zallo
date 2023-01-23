import { gql, useMutation } from '@apollo/client';
import { ZERO_ADDR } from '@site/../lib/dist';
import { useEffect, useState } from 'react';
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
      query FirstPendingProposal($account: Address!) {
        proposals(accounts: [$account], state: Pending, take: 1) {
          id
        }
      }
    `,
    {
      variables: { account },
    },
  ).data.proposals[0]?.id;

const usePropose = () =>
  useMutation<ProposeTestMutation, ProposeTestMutationVariables>(
    gql`
      mutation ProposeTest($account: Address!, $to: Address!, $value: Uint256) {
        propose(account: $account, to: $to, value: $value) {
          id
        }
      }
    `,
  )[0];

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
          variables: { account, to: device.address, value: 15000 },
        });
        setProposal(data?.propose.id);
      }
    })();
  }, [account, device.address, proposal, propose]);

  return proposal;
};
