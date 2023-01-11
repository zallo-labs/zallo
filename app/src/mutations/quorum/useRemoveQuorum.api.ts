import { gql } from '@apollo/client';
import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import {
  QuorumDocument,
  QuorumQuery,
  QuorumQueryVariables,
  useRemoveQuorumMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';

gql`
  mutation RemoveQuorum($account: Address!, $key: QuorumKey!) {
    removeQuorum(account: $account, key: $key) {
      id
    }
  }
`;

export const useRemoveQuorum = (quorum: QuorumGuid) => {
  const [mutate] = useRemoveQuorumMutation({ variables: quorum });

  return useCallback(
    () =>
      mutate({
        optimisticResponse: {
          removeQuorum: {
            id: `${quorum.account}-${quorum.key}`,
          },
        },
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
      }),
    [mutate, quorum],
  );
};
