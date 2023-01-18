import { gql } from '@apollo/client';
import assert from 'assert';
import { Address, QuorumGuid, QuorumKey, toQuorumKey } from 'lib';
import { useCallback } from 'react';
import { useCreateQuorumMutation } from '~/gql/generated.api';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';
import { useSelectQuorum } from '~/screens/account/quorums/useSelectQuorum';

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
  name: string;
  approvers?: Set<Address>;
  proposingQuorumKey?: QuorumKey;
}

export const useCreateQuorum = (accountAddr: Address) => {
  const [createQuorum] = useCreateQuorumMutation();
  const account = useAccount(accountAddr);
  const user = useUser();
  const selectQuorum = useSelectQuorum(accountAddr);

  return useCallback(
    async ({ name, approvers, proposingQuorumKey }: CreateQuorumOptions) => {
      const key = toQuorumKey(account.quorums[account.quorums.length - 1].key + 1);

      const r = await createQuorum({
        variables: {
          account: accountAddr,
          approvers: Array.from(approvers ?? new Set([user.id])),
          name,
          proposingQuorumKey: proposingQuorumKey ?? (await selectQuorum()).key,
        },
        optimisticResponse: {
          createQuorum: {
            id: `${accountAddr}-${key}`,
            key,
          },
        },
        // TODO: cache update account.quorums
      });

      assert(r.data);
      const quorum: QuorumGuid = {
        account: accountAddr,
        key: toQuorumKey(r.data.createQuorum.key),
      };

      return { ...r, quorum };
    },
    [account.quorums, accountAddr, createQuorum, selectQuorum, user.id],
  );
};
