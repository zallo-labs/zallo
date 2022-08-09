import { gql, useMutation } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import {
  CommentsQuery,
  CommentsQueryVariables,
  DeleteCommentMutation,
  DeleteCommentMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { useSelectedWallet } from '~/components2/wallet/useSelectedWallet';
import { Comment, COMMENTS_QUERY } from '~/queries/useComments.api';

const MUTATION = gql`
  mutation DeleteComment($account: Address!, $key: Id!, $nonce: Int!) {
    deleteComment(account: $account, key: $key, nonce: $nonce) {
      id
    }
  }
`;

export const useDeleteComment = () => {
  const { accountAddr } = useSelectedWallet();
  const device = useDevice();

  const [mutate] = useMutation<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >(MUTATION, { client: useApiClient() });

  const del = useCallback(
    (c: Comment) => {
      if (c.author !== device.address)
        throw new Error("Can't delete comment that you didn't write");

      return mutate({
        variables: {
          account: accountAddr,
          key: c.key,
          nonce: c.nonce,
        },
        update: (cache, res) => {
          const id = res?.data?.deleteComment?.id;
          if (!id) return;

          const opts: QueryOpts<CommentsQueryVariables> = {
            query: COMMENTS_QUERY,
            variables: { account: accountAddr, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
            opts,
          );

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            overwrite: true,
            data: {
              comments: (data?.comments ?? []).filter((c) => c.id !== id),
            },
          });
        },
        optimisticResponse: {
          deleteComment: {
            __typename: 'Comment',
            id: c.id,
          },
        },
      });
    },
    [mutate, accountAddr, device.address],
  );

  return del;
};
