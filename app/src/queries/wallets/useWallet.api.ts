import { gql } from '@apollo/client';
import { useWalletQuery, WalletQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId, address, toWalletRef, toQuorum } from 'lib';
import { useMemo } from 'react';
import {
  CombinedQuorum,
  CombinedWallet,
  ProposableState,
  QUERY_WALLETS_POLL_INTERVAL,
  WalletId,
} from '.';
import { API_WALLET_ID_FIELDS } from './useWalletIds.api';

export const API_WALLET_FIELDS = gql`
  ${API_WALLET_ID_FIELDS}

  fragment WalletFields on Wallet {
    ...WalletIdFields
    name
    quorums {
      approvers {
        userId
      }
      createProposal {
        submissions {
          finalized
        }
      }
      removeProposal {
        submissions {
          finalized
        }
      }
    }
    createProposal {
      submissions {
        finalized
      }
    }
    removeProposal {
      submissions {
        finalized
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

type RemoveProposalable = Pick<
  NonNullable<NonNullable<WalletQuery['wallet']>['quorums']>[0],
  'removeProposal'
>;

const getProposalState = ({
  removeProposal,
}: RemoveProposalable): ProposableState =>
  removeProposal?.submissions?.length &&
  removeProposal.submissions.some((s) => s.finalized)
    ? 'removed'
    : 'added';

export const useApiWallet = (id?: WalletId) => {
  const { data, ...rest } = useWalletQuery({
    client: useApiClient(),
    pollInterval: QUERY_WALLETS_POLL_INTERVAL,
    variables: {
      wallet: { accountId: id?.accountAddr, ref: id?.ref },
    },
    skip: !id,
  });

  const apiWallet = useMemo((): CombinedWallet | undefined => {
    if (!data?.wallet) return undefined;

    const w = data.wallet;
    return {
      id: toId(w.id),
      accountAddr: address(w.accountId),
      ref: toWalletRef(w.ref),
      name: w.name,
      state: getProposalState(w),
      quorums:
        w.quorums?.map(
          (quorum): CombinedQuorum => ({
            approvers: toQuorum(
              quorum.approvers?.map((a) => address(a.userId)) ?? [],
            ),
            state: getProposalState(quorum),
          }),
        ) ?? [],
    };
  }, [data?.wallet]);

  return { apiWallet, ...rest };
};
