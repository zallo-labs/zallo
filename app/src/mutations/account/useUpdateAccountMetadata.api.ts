import { gql } from '@apollo/client';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  useUpdateAccountMetadataMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { useCallback } from 'react';
import { CombinedAccount } from '~/queries/account/useAccount.api';

gql`
  mutation UpdateAccountMetadata($account: Address!, $name: String!) {
    updateAccountMetadata(id: $account, name: $name) {
      id
      name
    }
  }
`;

export interface UpdateAccountMetadataOptions {
  name: string;
}

export const useUpdateAccountMetadata = (account?: CombinedAccount) => {
  const [mutate] = useUpdateAccountMetadataMutation();

  return useCallback(
    ({ name }: UpdateAccountMetadataOptions) =>
      account &&
      name !== account.name &&
      mutate({
        variables: { account: account.addr, name },
        optimisticResponse: {
          updateAccountMetadata: {
            id: account.addr,
            name,
          },
        },
        update: (cache, res) => {
          const r = res.data?.updateAccountMetadata;
          if (!r) return;

          updateQuery<AccountQuery, AccountQueryVariables>({
            cache,
            query: AccountDocument,
            variables: { account: account.addr },
            updater: (data) => {
              if (data.account) data.account.name = r.name;
            },
          });
        },
      }),
    [account, mutate],
  );
};
