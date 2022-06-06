import { useQuery } from '@apollo/client';
import { Activity } from '@features/activity/ActivityItem';
import { useSafe } from '@features/safe/SafeProvider';
import { subGql } from '@gql/clients';
import { useSubgraphClient } from '@gql/GqlProvider';
import {
  GetTransfers,
  GetTransfersVariables,
  GetTransfers_transfers,
  TransferType,
} from '@gql/subgraph.generated';
import { BytesLike } from 'ethers';
import { BigNumber } from 'ethers';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const TRANSFER_FIELDS = subGql`
fragment TransferFields on Transfer {
  id
  type
  token
  from
  to
  value
  blockHash
  timestamp
}
`;

const SUB_QUERY = subGql`
${TRANSFER_FIELDS}

query GetTransfers($safe: String!) {
  transfers(where: { safe: $safe, tx: null }) {
    ...TransferFields
  }
}
`;

interface Base {
  id: Id;
  tokenAddr: Address;
  addr: Address;
  value: BigNumber;
  blockHash: BytesLike;
  timestamp: DateTime;
}

export interface InTransfer extends Base {
  from: Address;
}

export interface OutTransfer extends Base {
  to: Address;
}

export type Transfer = InTransfer | OutTransfer;

export const fieldsToTransfer = (t: GetTransfers_transfers): Transfer => ({
  id: toId(t.id),
  tokenAddr: address(t.token),
  addr: address(t.type === TransferType.IN ? t.from : t.to),
  value: BigNumber.from(t.value),
  blockHash: t.blockHash,
  timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
  ...(t.type === TransferType.IN
    ? { from: address(t.from) }
    : { to: address(t.to) }),
});

export const isTransfer = (a: Activity): a is Transfer =>
  'tokenAddr' in a && 'timestamp' in a && 'value' in a;
export const isInTransfer = (t: Transfer): t is InTransfer => 'from' in t;
export const isOutTransfer = (t: Transfer): t is OutTransfer =>
  !isInTransfer(t);

// Transfers independent of a tx
export const useIndependentTransfers = () => {
  const { safe } = useSafe();

  const { data, ...rest } = useQuery<GetTransfers, GetTransfersVariables>(
    SUB_QUERY,
    {
      client: useSubgraphClient(),
      variables: { safe: toId(safe.address) },
    },
  );

  const transfers = useMemo(
    () => data?.transfers.map(fieldsToTransfer) ?? [],
    [data],
  );

  return { transfers, ...rest };
};
