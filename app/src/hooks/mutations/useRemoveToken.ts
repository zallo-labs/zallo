import { graphql, readInlineData, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import {
  useRemoveTokenMutation,
  useRemoveTokenMutation$data,
} from '~/api/__generated__/useRemoveTokenMutation.graphql';
import { useRemoveToken_token$key } from '~/api/__generated__/useRemoveToken_token.graphql';
import { useConfirmRemoval } from '../useConfirm';
import { asChain } from 'lib';
import { useRemoveTokenUpdatableQuery } from '~/api/__generated__/useRemoveTokenUpdatableQuery.graphql';
import { useFragment } from 'react-relay';
import { useRemoveToken_query$key } from '~/api/__generated__/useRemoveToken_query.graphql';

graphql`
  fragment useRemoveToken_assignable_token on Token @assignable {
    __typename
  }
`;

export interface RemoveTokenParams {
  query: useRemoveToken_query$key;
}

export function useRemoveToken(params: RemoveTokenParams) {
  const confirm = useConfirmRemoval({
    message: 'Are you sure you want to remove this token?',
  });

  const { tokens } = useFragment(
    graphql`
      fragment useRemoveToken_query on Query @argumentDefinitions(chain: { type: "Chain!" }) {
        tokens(input: { chain: $chain, query: null }) {
          id
          ...useRemoveToken_assignable_token
        }
      }
    `,
    params.query,
  );

  const commit = useMutation<useRemoveTokenMutation>(graphql`
    mutation useRemoveTokenMutation($address: UAddress!) @raw_response_type {
      removeToken(address: $address) @deleteRecord
    }
  `);

  return async (tokenKey: useRemoveToken_token$key) => {
    if (!(await confirm())) return;

    const token = readInlineData(
      graphql`
        fragment useRemoveToken_token on Token @inline {
          id
          address
        }
      `,
      tokenKey,
    );

    const updater: SelectorStoreUpdater<useRemoveTokenMutation$data> = (store, data) => {
      if (!data?.removeToken) return;

      const { updatableData } = store.readUpdatableQuery<useRemoveTokenUpdatableQuery>(
        graphql`
          query useRemoveTokenUpdatableQuery($chain: Chain!) @updatable {
            tokens(input: { chain: $chain, query: null }) {
              ...useRemoveToken_assignable_token
            }
          }
        `,
        { chain: asChain(token.address) },
      );
      updatableData.tokens = tokens.filter((t) => t.id !== data.removeToken);
    };

    return commit(
      { address: token.address },
      {
        optimisticResponse: { removeToken: token.id },
        optimisticUpdater: updater,
        updater,
      },
    );
  };
}
