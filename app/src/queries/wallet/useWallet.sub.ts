import { gql } from '@apollo/client';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { address, toWalletRef, toId, toQuorum } from 'lib';
import {
  CombinedWallet,
  CombinedQuorum,
  QUERY_WALLETS_POLL_INTERVAL,
  WalletId,
} from '../wallets';
import { useMemo } from 'react';
import { useWalletQuery } from '~/gql/generated.sub';
import { SUB_WALLET_ID_FIELDS } from '../wallets/useWalletIds.sub';
import { elipseTruncate } from '~/util/format';

gql`
  ${SUB_WALLET_ID_FIELDS}

  query Wallet($wallet: ID!) {
    wallet(id: $wallet) {
      ...SubWalletIdFields
      active
      quorums {
        id
        hash
        approvers {
          approver {
            id
          }
        }
        timestamp
      }
    }
  }
`;

export const useSubWallet = (id?: WalletId) => {
  const { data, ...rest } = useWalletQuery({
    client: useSubgraphClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
    variables: { wallet: id?.id ?? '' },
    skip: !id,
  });

  const subWallet = useMemo((): CombinedWallet | undefined => {
    if (!data?.wallet) return undefined;

    const w = data.wallet;
    if (!w.active) return undefined;

    return {
      id: toId(w.id),
      accountAddr: address(w.account.id),
      ref: toWalletRef(w.ref),
      name: `${elipseTruncate(w.ref, 4)} wallet`,
      state: { status: 'active' },
      quorums: w.quorums.map(
        (quorum): CombinedQuorum => ({
          approvers: toQuorum(
            quorum.approvers.map(({ approver }) => address(approver.id)),
          ),
          state: { status: 'active' },
        }),
      ),
    };
  }, [data?.wallet]);

  return { subWallet, ...rest };
};
