import { gql } from '@apollo/client';
import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import {
  QuorumDocument,
  QuorumQuery,
  QuorumQueryVariables,
  useUpdateQuorumMetadataMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';

gql`
  mutation UpdateQuorumMetadata($account: Address!, $key: QuorumKey!, $name: String!) {
    updateQuorumMetadata(account: $account, key: $key, name: $name) {
      id
      name
    }
  }
`;

export interface UpdateQuorumMetadataOptions {
  name: string;
}

export const useUpdateQuorumMetadata = (quorum: QuorumGuid) => {
  const [mutate] = useUpdateQuorumMetadataMutation();

  return useCallback(
    ({ name }: UpdateQuorumMetadataOptions) =>
      mutate({
        variables: {
          ...quorum,
          name,
        },
        optimisticResponse: {
          updateQuorumMetadata: {
            id: `${quorum.account}-${quorum.key}`,
            name,
          },
        },
        update: (cache, res) => {
          const q = res.data?.updateQuorumMetadata;
          if (!q) return;

          updateQuery<QuorumQuery, QuorumQueryVariables>({
            cache,
            query: QuorumDocument,
            updater: (data) => {
              if (data.quorum) data.quorum.name = name;
            },
          });
        },
      }),
    [mutate, quorum],
  );
};
