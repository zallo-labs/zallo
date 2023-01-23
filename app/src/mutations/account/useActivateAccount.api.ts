import { gql } from '@apollo/client';
import { useMemo } from 'react';
import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
  useActivateAccountMutation,
} from '~/gql/generated.api';
import { updateQuery } from '~/gql/update';
import { CombinedAccount } from '~/queries/account/useAccount.api';

gql`
  mutation ActivateAccount($account: Address!) {
    activateAccount(id: $account)
  }
`;

export const useActivateAccount = (account: CombinedAccount) => {
  const [mutation] = useActivateAccountMutation({
    variables: { account: account.addr },
    optimisticResponse: {
      activateAccount: true,
    },
    update: (cache, res) => {
      if (!res.data?.activateAccount) return;

      // Account: update isDeployed
      updateQuery<AccountQuery, AccountQueryVariables>({
        cache,
        query: AccountDocument,
        variables: { account: account.addr },
        updater: (data) => void (data.account!.isActive = true),
      });
    },
  });

  return useMemo(() => {
    if (account.active) return undefined;

    return () => mutation();
  }, [account.active, mutation]);
};
