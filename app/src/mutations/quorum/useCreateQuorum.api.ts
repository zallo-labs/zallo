import { gql } from '@apollo/client';
import { Address, QuorumKey, toQuorumKey } from 'lib';
import { useCallback } from 'react';
import { useCreateQuorumMutation } from '~/gql/generated.api';
import { useAccount } from '~/queries/account/useAccount.api';

gql`
  mutation CreateQuorum(
    $account: Address!
    $approvers: [Address!]!
    $name: String!
    $proposingQuorumKey: QuorumKey!
  ) {
    createQuorum(
      account: $account
      approvers: $approvers
      name: $name
      proposingQuorumKey: $proposingQuorumKey
    ) {
      id
      key
    }
  }
`;

export interface CreateQuorumOptions {
  approvers: Set<Address>;
  name: string;
  proposingQuorumKey: QuorumKey;
}

export const useCreateQuorum = (accountAddr: Address) => {
  const [createQuorum] = useCreateQuorumMutation();
  const account = useAccount(accountAddr);

  return useCallback(
    ({ approvers, name, proposingQuorumKey }: CreateQuorumOptions) => {
      const key = toQuorumKey(account.quorums[account.quorums.length - 1].key + 1);

      return createQuorum({
        variables: {
          account: accountAddr,
          approvers: Array.from(approvers),
          name,
          proposingQuorumKey,
        },
        optimisticResponse: {
          createQuorum: {
            id: `${accountAddr}-${key}`,
            key,
          },
        },
        // TODO: cache update account.quorums
      });
    },
    [account.quorums, accountAddr, createQuorum],
  );
};
