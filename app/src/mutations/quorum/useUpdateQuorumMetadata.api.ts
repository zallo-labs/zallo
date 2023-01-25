import { gql } from '@apollo/client';
import assert from 'assert';
import { QuorumGuid } from 'lib';
import { useCallback } from 'react';
import {
  AccountsDocument,
  AccountsQuery,
  AccountsQueryVariables,
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

          updateQuery<AccountsQuery, AccountsQueryVariables>({
            query: AccountsDocument,
            cache,
            variables: {},
            updater: (data) => {
              const account = data.accounts.find((a) => a.id === quorum.account);
              assert(account);

              const q = account.quorums?.find((q) => q.key === quorum.key);
              assert(q);

              q.name = name;
            },
          });
        },
      }),
    [mutate, quorum],
  );
};
