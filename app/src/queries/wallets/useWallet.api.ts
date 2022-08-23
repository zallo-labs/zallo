import { gql } from '@apollo/client';
import { useWalletQuery, WalletQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { toId, address, toQuorum, getWalletId } from 'lib';
import { useMemo } from 'react';
import {
  CombinedQuorum,
  CombinedWallet,
  ProposableState,
  QUERY_WALLETS_POLL_INTERVAL,
  WalletId,
} from '.';

export const API_WALLET_FIELDS = gql`
  fragment ProposalFields on Tx {
    hash
    submissions {
      finalized
    }
  }

  fragment WalletFields on Wallet {
    id
    name
    quorums {
      approvers {
        userId
      }
      createProposal {
        ...ProposalFields
      }
      removeProposal {
        ...ProposalFields
      }
    }
    createProposal {
      ...ProposalFields
    }
    removeProposal {
      ...ProposalFields
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

// Only a single proposed modification can exist at a time
const getProposedModificationHash = (
  ...proposals: RemoveProposalable['removeProposal'][]
) => proposals.find((p) => p?.submissions?.every((s) => !s.finalized))?.hash;

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

    return {
      id: toId(w.id),
      accountAddr: id!.accountAddr,
      ref: id!.ref,
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
      proposedModificationHash: getProposedModificationHash(
        w.createProposal,
        w.removeProposal,
        ...(w.quorums?.flatMap((q) => [q.createProposal, q.removeProposal]) ??
          []),
      ),
    };
  }, [data?.wallet, id]);

  return { apiWallet, ...rest };
};
