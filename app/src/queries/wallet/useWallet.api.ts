import { gql } from '@apollo/client';
import { useWalletQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { toId, address, toQuorum, Address } from 'lib';
import { useMemo } from 'react';
import {
  CombinedQuorum,
  CombinedWallet,
  QUERY_WALLETS_POLL_INTERVAL,
  TokenLimit,
  WalletId,
} from '../wallets';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { BigNumber } from 'ethers';
import { Proposable } from '~/gql/proposable';

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
    spendingAllowlisted
    limits {
      token
      amount
      period
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
    variables: {
      wallet: { accountId: id?.accountAddr ?? '', ref: id?.ref ?? '' },
    },
    skip: !id,
  });
  usePollWhenFocussed(rest, QUERY_WALLETS_POLL_INTERVAL);

  const apiWallet = useMemo((): CombinedWallet | undefined => {
    const w = data?.wallet;
    if (!w?.id) return undefined; // w.id is sometimes undefined sometimes when w is not 🤷

    if (!w.state) return undefined;

    const quorums =
      w.quorums
        ?.filter((q) => q.state)
        .map(
          (quorum): CombinedQuorum => ({
            approvers: toQuorum(
              quorum.approvers?.map((a) => address(a.userId)) ?? [],
            ),
            state: {
              status: quorum.state!.status,
              proposedModification: quorum.state?.proposedModificationHash
                ? {
                    account: id!.accountAddr,
                    hash: quorum.state?.proposedModificationHash,
                  }
                : undefined,
            },
          }),
        ) ?? [];

    // Find first inactive wallet's proposal
    const proposedModification = quorums
      .filter(
        (q) => q.state.status !== 'active' && q.state.proposedModification,
      )
      .find((q) => q.state.proposedModification)?.state.proposedModification;

    return {
      id: toId(w.id),
      accountAddr: id!.accountAddr,
      ref: id!.ref,
      name: w.name,
      state: {
        status: w.state.status,
        proposedModification,
      },
      quorums,
      limits: {
        allowlisted: { proposed: w.spendingAllowlisted },
        tokens: Object.fromEntries(
          w.limits?.map((t): [Address, Proposable<TokenLimit>] => [
            address(t.token),
            {
              proposed: {
                amount: BigNumber.from(t.amount),
                period: t.period,
              },
            },
          ]) ?? [],
        ),
      },
    };
  }, [data?.wallet, id]);

  return { apiWallet, ...rest };
};
