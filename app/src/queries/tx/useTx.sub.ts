import { gql } from '@apollo/client';
import { TransferType, useTxSubmissionsQuery } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { BigNumber } from 'ethers';
import { address, getTxId, toId, ZERO, ZERO_ADDR, ZERO_TX_SALT } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { ExecutedTx, QUERY_TX_POLL_INTERVAL, TxId } from '.';

gql`
  query TxSubmissions($account: String!, $hash: Bytes!) {
    txes(
      where: { account: $account, hash: $hash }
      first: 1
      orderBy: blockHash
      orderDirection: desc
    ) {
      id
      transactionHash
      success
      response
      executor
      blockHash
      timestamp
      transfers {
        id
        token
        type
        from
        to
        value
        blockHash
        timestamp
      }
    }
  }
`;

export const useSubTx = (id: TxId) => {
  const { data, ...rest } = useTxSubmissionsQuery({
    client: useSubgraphClient(),
    variables: {
      account: toId(id.account),
      hash: toId(id.hash),
    },
    pollInterval: QUERY_TX_POLL_INTERVAL,
  });

  const tx = useMemo((): ExecutedTx | undefined => {
    const t = data?.txes[0];
    if (!t) return undefined;

    const timestamp = DateTime.fromSeconds(parseInt(t.timestamp));

    return {
      id: toId(t.id),
      account: address(id.account),
      hash: id.hash,
      response: t.response,
      executor: address(t.executor),
      blockHash: t.blockHash,
      proposedAt: timestamp,
      executedAt: timestamp,
      timestamp,
      transfers: t.transfers.map((t) => ({
        id: toId(t.id),
        tokenAddr: address(t.token),
        addr: address(t.type === TransferType.In ? t.from : t.to),
        value: BigNumber.from(t.value),
        blockHash: t.blockHash,
        timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
        ...(t.type === TransferType.In
          ? { from: address(t.from) }
          : { to: address(t.to) }),
      })),
      to: ZERO_ADDR,
      value: ZERO,
      data: [],
      salt: ZERO_TX_SALT,
      approvals: [],
      userHasApproved: false,
      submissions: [
        {
          timestamp,
          hash: t.transactionHash,
          nonce: 0,
          status: t.success ? 'success' : 'failure',
          gasLimit: ZERO,
        }
      ],
      status: t.success ? 'executed' : 'failed',
    };
  }, [data?.txes, id.account, id.hash]);

  return { tx, ...rest };
};
