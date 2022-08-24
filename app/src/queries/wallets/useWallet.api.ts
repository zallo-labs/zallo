import { gql } from '@apollo/client';
import { useWalletQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { toId, address, toQuorum } from 'lib';
import { useMemo } from 'react';
import {
  CombinedQuorum,
  CombinedWallet,
  QUERY_WALLETS_POLL_INTERVAL,
  WalletId,
} from '.';

export const API_WALLET_FIELDS = gql`
  fragment WalletFields on Wallet {
    id
    name
    state {
      status
      proposedModificationHash
    }
    quorums {
      accountId
      walletRef
      hash
      approvers {
        userId
      }
      state {
        status
        proposedModificationHash
      }
    }
  }
`;

export const API_QUERY_WALLET = gql`
  ${API_WALLET_FIELDS}

  query Wallet($wallet: WalletId!) {
    wallet(id: $wallet) {
      ...WalletFields
    }
  }
`;

export const useApiWallet = (id?: WalletId) => {
  const { data, ...rest } = useWalletQuery({
    client: useApiClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
    variables: {
      wallet: { accountId: id?.accountAddr ?? '', ref: id?.ref ?? '' },
    },
    skip: !id,
  });

  const apiWallet = useMemo((): CombinedWallet | undefined => {
    const w = data?.wallet;
    if (!w?.id) return undefined; // w.id is sometimes undefined sometimes when w is not 🤷

    if (!w.state) return undefined;

    return {
      id: toId(w.id),
      accountAddr: id!.accountAddr,
      ref: id!.ref,
      name: w.name,
      state: w.state.status,
      proposedModificationHash: w.state.proposedModificationHash ?? undefined,
      quorums:
        w.quorums
          ?.filter((q) => q.state)
          .map(
            (quorum): CombinedQuorum => ({
              approvers: toQuorum(
                quorum.approvers?.map((a) => address(a.userId)) ?? [],
              ),
              state: quorum.state!.status,
              proposedModificationHash:
                w.state!.proposedModificationHash ?? undefined,
            }),
          ) ?? [],
    };
  }, [data?.wallet, id]);

  return { apiWallet, ...rest };
};
