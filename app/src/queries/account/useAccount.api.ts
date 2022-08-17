import { gql } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { useAccountQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { Address, address, connectAccount, toDeploySalt, toId } from 'lib';
import { useMemo } from 'react';
import { ACCOUNT_IMPL } from '~/provider';
import { CombinedAccount, QUERY_ACCOUNT_POLL_INTERVAL } from '.';
import {
  apiWalletFieldsToId,
  API_WALLET_ID_FIELDS,
} from '../wallets/useWalletIds.api';

export const API_ACCOUNT_FIELDS = gql`
  ${API_WALLET_ID_FIELDS}

  fragment AccountFields on Account {
    id
    name
    impl
    deploySalt
    wallets {
      ...WalletIdFields
    }
  }
`;

export const API_ACCOUNT_QUERY = gql`
  ${API_ACCOUNT_FIELDS}

  query Account($account: Address!) {
    account(id: $account) {
      ...AccountFields
    }
  }
`;

export const useApiAccount = (addr?: Address) => {
  const device = useDevice();

  const { data, ...rest } = useAccountQuery({
    client: useApiClient(),
    pollInterval: QUERY_ACCOUNT_POLL_INTERVAL,
    variables: { account: addr },
    skip: !addr,
  });

  const apiAccount = useMemo((): CombinedAccount | undefined => {
    const acc = data?.account;
    if (!acc?.id) return undefined;

    return {
      id: toId(acc.id),
      addr: addr!,
      contract: connectAccount(addr!, device),
      impl: acc.impl ? address(acc.impl) : ACCOUNT_IMPL,
      deploySalt: acc.deploySalt ? toDeploySalt(acc.deploySalt) : undefined,
      name: acc.name,
      walletIds: acc.wallets?.map(apiWalletFieldsToId) ?? [],
    };
  }, [data?.account, addr, device]);

  return { apiAccount, ...rest };
};
