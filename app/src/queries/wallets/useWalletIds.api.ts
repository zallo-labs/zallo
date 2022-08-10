import { gql } from '@apollo/client';
import {
  useUserWalletIdsQuery,
  WalletIdFieldsFragment,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId, address, toWalletRef } from 'lib';
import { useMemo } from 'react';
import { QUERY_WALLETS_POLL_INTERVAL, WalletId } from '.';

export const API_WALLET_ID_FIELDS = gql`
  fragment WalletIdFields on Wallet {
    id
    accountId
    ref
  }
`;

export const API_QUERY_USER_WALLETS = gql`
  ${API_WALLET_ID_FIELDS}

  query UserWalletIds {
    userWallets {
      ...WalletIdFields
    }
  }
`;

export const apiWalletFieldsToId = (w: WalletIdFieldsFragment): WalletId => ({
  id: toId(w.id),
  accountAddr: address(w.accountId),
  ref: toWalletRef(w.ref),
});

export const useApiUserWalletIds = () => {
  const { data, ...rest } = useUserWalletIdsQuery({
    client: useApiClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
  });

  const walletIds = useMemo(
    (): WalletId[] => data?.userWallets.map(apiWalletFieldsToId) ?? [],
    [data?.userWallets],
  );

  return { data: walletIds, ...rest };
};
