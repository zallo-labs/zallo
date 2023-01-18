import { gql } from '@apollo/client';
import { assert } from 'console';
import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import {
  QuorumDocument,
  QuorumFieldsFragmentDoc,
  QuorumQuery,
  QuorumQueryVariables,
  useRemoveQuorumMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { ProposalId } from '~/queries/proposal';

gql`
  ${QuorumFieldsFragmentDoc}

  mutation RemoveQuorum($account: Address!, $key: QuorumKey!) {
    removeQuorum(account: $account, key: $key) {
      ...QuorumFields
    }
  }
`;

export const useRemoveQuorum = (quorum: QuorumGuid) => {
  const [mutate] = useRemoveQuorumMutation({ variables: quorum });

  return useCallback(async () => {
    const r = await mutate({
      // optimisticResponse: {
      //   removeQuorum: {
      //     id: `${quorum.account}-${quorum.key}`,
      //   },
      // },
      // TODO: optimistic update - add isRemoved proposedState
      // update: (cache, res) => {
      //   const q = res.data?.removeQuorum;
      //   if (!q) return;
      //   updateQuery<QuorumQuery, QuorumQueryVariables>({
      //     cache,
      //     query: QuorumDocument,
      //     variables: quorum,
      //     updater: (data) => {
      //       data.quorum?.proposedStates.push({
      //         // TODO: ...
      //       })
      //     }
      //   })
      // },
    });

    const p = r.data?.removeQuorum?.proposedStates[0].proposalId;
    const removeProposal: ProposalId | undefined = p ? { id: p } : undefined;

    return { ...r, removeProposal };
  }, [mutate]);
};
