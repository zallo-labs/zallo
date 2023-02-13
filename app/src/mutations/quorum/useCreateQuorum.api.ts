import { gql } from '@apollo/client';
import assert from 'assert';
import { Address, QuorumGuid, QuorumKey, toQuorumKey } from 'lib';
import { useCallback } from 'react';
import {
  AccountsDocument,
  QuorumFieldsFragmentDoc,
  useCreateQuorumMutation,
} from '~/gql/generated.api';
import { useUser } from '~/queries/useUser.api';
import { useSelectQuorum } from '~/screens/account/quorums/useSelectQuorum';

gql`
  ${QuorumFieldsFragmentDoc}

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
      ...QuorumFields
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
  const user = useUser();
  const selectQuorum = useSelectQuorum(accountAddr);

  return useCallback(
    async ({ name, approvers, proposingQuorumKey }: CreateQuorumOptions) => {
      const r = await createQuorum({
        variables: {
          account: accountAddr,
          approvers: Array.from(approvers ?? new Set([user.id])),
          name,
          proposingQuorumKey: proposingQuorumKey ?? (await selectQuorum()).key,
        },
        refetchQueries: [AccountsDocument],
      });

      assert(r.data);
      const quorum: QuorumGuid = {
        account: accountAddr,
        key: toQuorumKey(r.data.createQuorum.key),
      };

      return { ...r, quorum };
    },
    [accountAddr, createQuorum, selectQuorum, user.id],
  );
};
