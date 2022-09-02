import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useTxQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { BigNumber } from 'ethers';
import { address, getWalletId, toId, toTxSalt, toWalletRef } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  Approval,
  ProposedTx,
  QUERY_TX_POLL_INTERVAL,
  Submission,
  TxId,
} from '../.';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';

export const API_TX_FIELDS = gql`
  fragment TxFields on Tx {
    id
    accountId
    hash
    to
    value
    data
    salt
    walletRef
    approvals {
      userId
      signature
      createdAt
    }
    createdAt
    submissions {
      id
      hash
      nonce
      gasLimit
      gasPrice
      finalized
      createdAt
    }
  }
`;

export const API_QUERY_TX = gql`
  ${API_TX_FIELDS}

  query Tx($account: Address!, $hash: Bytes32!) {
    tx(account: $account, hash: $hash) {
      ...TxFields
    }
  }
`;

export const useApiTx = (id?: TxId) => {
  const device = useDevice();

  const { data, ...rest } = useTxQuery({
    client: useApiClient(),
    variables: {
      account: id?.account,
      hash: id?.hash,
    },
    skip: !id,
  });
  usePollWhenFocussed(rest, QUERY_TX_POLL_INTERVAL);

  const tx = useMemo((): ProposedTx | undefined => {
    const tx = data?.tx;
    if (!tx) return undefined;

    const timestamp = DateTime.fromISO(tx.createdAt);

    const approvals: Approval[] =
      tx.approvals?.map((a) => ({
        addr: address(a.userId),
        signature: a.signature,
        timestamp: DateTime.fromISO(a.createdAt),
      })) ?? [];

    const account = address(tx.accountId);
    const walletRef = toWalletRef(tx.walletRef);

    return {
      id: toId(tx.id),
      account,
      hash: tx.hash,
      to: address(tx.to),
      value: BigNumber.from(tx.value),
      data: tx.data,
      salt: toTxSalt(tx.salt),
      wallet: {
        id: getWalletId(account, walletRef),
        accountAddr: account,
        ref: walletRef,
      },
      approvals,
      userHasApproved: !!approvals.find((a) => a.addr === device.address),
      submissions:
        tx.submissions?.map(
          (s): Submission => ({
            hash: s.hash,
            nonce: s.nonce,
            status: 'pending',
            timestamp: DateTime.fromISO(s.createdAt),
            gasLimit: BigNumber.from(s.gasLimit),
            gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
          }),
        ) ?? [],
      proposedAt: timestamp,
      timestamp,
      status: tx.submissions?.length ? 'submitted' : 'proposed',
    };
  }, [data?.tx, device.address]);

  return { tx, ...rest };
};
