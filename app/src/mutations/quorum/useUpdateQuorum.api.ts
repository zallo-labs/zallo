import { gql } from '@apollo/client';
import { Quorum, QuorumGuid, QuorumKey } from 'lib';
import { useCallback } from 'react';
import { QuorumFieldsFragmentDoc, useUpdateQuorumMutation } from '~/gql/generated.api';
import { ProposalId } from '~/queries/proposal';
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
    async ({ proposingQuorumKey, approvers, spending }: UpdateQuorumOptions) => {
      const r = await mutate({
        variables: {
          ...quorumGuid,
          proposingQuorumKey:
            proposingQuorumKey ?? quorum.active?.key ?? (await selectQuorum()).key,
          approvers: [...approvers],
          spending: spending
            ? {
                fallback: spending.fallback,
                limits: Object.values(spending.limits ?? {}).map(({ token, amount, period }) => ({
                  token,
                  amount: amount.toString(),
                  period,
                })),
              }
            : undefined,
        },
      });

      const id = r.data?.updateQuorum.proposedStates[0].proposalId;
      const updateProposal: ProposalId | undefined = id ? { id } : undefined;

      return {
        ...r,
        updateProposal,
      };
    },
    [mutate, quorum.active?.key, quorumGuid, selectQuorum],
  );
};
