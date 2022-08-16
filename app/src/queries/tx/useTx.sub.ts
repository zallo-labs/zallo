import { gql } from '@apollo/client';
import { TransferType, useTxQuery } from '@gql/generated.sub';
import { useSubgraphClient } from '@gql/GqlProvider';
import { BigNumber } from 'ethers';
import { address, getTxId, toId, ZERO, ZERO_ADDR, ZERO_TX_SALT } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { ExecutedTx, TxId } from '.';

gql`
  query Tx($id: ID!) {
    tx(id: $id) {
      id
      account {
        id
      }
      hash
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
  const { data, ...rest } = useTxQuery({
    client: useSubgraphClient(),
    variables: {
      id: getTxId(id.account, id.hash),
    },
  });

  const tx = useMemo((): ExecutedTx | undefined => {
    const t = data?.tx;
    if (!t) return undefined;

    const timestamp = DateTime.fromSeconds(parseInt(t.timestamp));

    return {
      id: toId(t.id),
      account: address(t.account.id),
      hash: t.hash,
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
      submissions: [],
      status: t.success ? 'executed' : 'failed',
    };
  }, [data?.tx]);

  return { tx, ...rest };
};
