import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useAccountQuery } from '~/gql/generated.sub';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { Address, address, connectAccount, toId } from 'lib';
import { useMemo } from 'react';
import { QUERY_ACCOUNT_POLL_INTERVAL, CombinedAccount } from '.';
import {
  subWalletFieldsToId,
  SUB_WALLET_ID_FIELDS,
} from '../wallets/useWalletIds.sub';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';

gql`
  ${SUB_WALLET_ID_FIELDS}

  query Account($account: ID!) {
    account(id: $account) {
      id
      impl {
        id
      }
      wallets {
        ...SubWalletIdFields
      }
    }
  }
`;

export const useSubAccount = (addr?: Address) => {
  const device = useDevice();

  const { data, ...rest } = useAccountQuery({
    client: useSubgraphClient(),
    variables: { account: addr ? toId(addr) : '' },
    skip: !addr,
  });
  usePollWhenFocussed(rest, QUERY_ACCOUNT_POLL_INTERVAL);

  const subAccount = useMemo((): CombinedAccount | undefined => {
    const acc = data?.account;
    if (!acc) return undefined;

    return {
      id: toId(acc.id),
      addr: addr!,
      contract: connectAccount(addr!, device),
      impl: address(acc.impl.id),
      name: '',
      walletIds: acc.wallets.map(subWalletFieldsToId),
    };
  }, [data?.account, addr, device]);

  return { subAccount, ...rest };
};
