import { gql } from '@apollo/client';
import { Address, Quorum, QuorumGuid, QuorumKey } from 'lib';
import { useCallback } from 'react';
import { QuorumFieldsFragmentDoc, useUpdateQuorumMutation } from '~/gql/generated.api';
import { useQuorum } from '~/queries/quroum/useQuorum.api';
import { useSelectQuorum } from '~/screens/account/quorums/useSelectQuorum';

gql`
  ${QuorumFieldsFragmentDoc}

  mutation UpdateQuorum(
    $account: Address!
    $key: QuorumKey!
    $proposingQuorumKey: QuorumKey
    $approvers: [Address!]!
    $spending: SpendingInput
  ) {
    updateQuorum(
      account: $account
      key: $key
      proposingQuorumKey: $proposingQuorumKey
      approvers: $approvers
      spending: $spending
    ) {
      ...QuorumFields
    }
  }
`;

export interface UpdateQuorumOptions extends Omit<Quorum, 'key'> {
  proposingQuorumKey?: QuorumKey;
}

export const useUpdateQuorum = (quorumGuid: QuorumGuid) => {
  const [mutate] = useUpdateQuorumMutation();
  const quorum = useQuorum(quorumGuid);
  const selectQuorum = useSelectQuorum(quorumGuid.account);

  // TODO: optimistic update
  return useCallback(
    ({ proposingQuorumKey: proposingQuorumKeyArg, approvers, spending }: UpdateQuorumOptions) => {
      const update = (proposingQuorumKey: QuorumKey) =>
        mutate({
          variables: {
            ...quorumGuid,
            proposingQuorumKey,
            approvers: [...approvers],
            spending: spending
              ? {
                  fallback: spending.fallback,
                  limits: Object.values(spending.limit ?? {}).map(({ token, amount, period }) => ({
                    token,
                    amount: amount.toString(),
                    period,
                  })),
                }
              : undefined,
          },
        });

      const proposer = proposingQuorumKeyArg || quorum.active?.key;
      return proposer ? update(proposer) : selectQuorum((proposer) => update(proposer.key));
    },
    [mutate, quorum.active?.key, quorumGuid, selectQuorum],
  );
};
