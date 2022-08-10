import { gql } from '@apollo/client';
import { useWalletQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId, address, toWalletRef, toQuorum } from 'lib';
import { useMemo } from 'react';
import { CombinedWallet, QUERY_WALLETS_POLL_INTERVAL, WalletId } from '.';
import { API_WALLET_ID_FIELDS } from './useWalletIds.api';

export const API_QUERY_WALLET = gql`
  ${API_WALLET_ID_FIELDS}

  query Wallet($wallet: WalletId!) {
    wallet(id: $wallet) {
      ...WalletIdFields
      name
      quorums {
        approvers {
          userId
        }
      }
    }
  }
`;

export const useApiWallet = (id: WalletId) => {
  const { data, ...rest } = useWalletQuery({
    client: useApiClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
    variables: {
      wallet: { accountId: id.accountAddr, ref: id.ref },
    },
  });

  const apiWallet = useMemo((): CombinedWallet | undefined => {
    if (!data?.wallet) return undefined;

    const w = data.wallet;
    return {
      id: toId(w.id),
      accountAddr: address(w.accountId),
      ref: toWalletRef(w.ref),
      name: w.name,
      quorums:
        w.quorums?.map((quorum) => ({
          approvers: toQuorum(
            quorum.approvers?.map((a) => address(a.userId)) ?? [],
          ),
        })) ?? [],
    };
  }, [data?.wallet]);

  return { apiWallet, ...rest };
};
