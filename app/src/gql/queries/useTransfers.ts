import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { subGql } from '@gql/clients';
import { useSubgraphClient } from '@gql/GqlProvider';
import {
  GetTokenTransfers,
  GetTokenTransfersVariables,
  TokenTransferType,
} from '@gql/subgraph.generated';
import { BigNumber } from 'ethers';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

const SUB_QUERY = subGql`
query GetTokenTransfers($safe: String!) {
  tokenTransfers(where: { safe: $safe }) {
    id
    token
    type
    timestamp
    from
    to
    value
  }
}
`;

interface Base {
  id: Id;
  tokenAddr: Address;
  timestamp: DateTime;
  value: BigNumber;
}

export interface InTransfer extends Base {
  from: Address;
}

export interface OutTransfer extends Base {
  to: Address;
}

export type Transfer = InTransfer | OutTransfer;

export const isInTransfer = (t: Transfer): t is InTransfer => 'from' in t;
export const isOutTransfer = (t: Transfer): t is OutTransfer =>
  !isInTransfer(t);

export const useTransfers = () => {
  const { safe } = useSafe();

  const { data, ...rest } = useQuery<
    GetTokenTransfers,
    GetTokenTransfersVariables
  >(SUB_QUERY, {
    client: useSubgraphClient(),
    variables: { safe: toId(safe.address) },
  });

  const transfers: Transfer[] = useMemo(
    () =>
      data?.tokenTransfers.map(
        (t): Transfer => ({
          id: toId(t.id),
          tokenAddr: address(t.token),
          timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
          value: BigNumber.from(t.value),
          ...(t.type === TokenTransferType.IN
            ? {
                from: address(t.from),
              }
            : {
                to: address(t.to),
              }),
        }),
      ) ?? [],
    [data],
  );

  return { transfers, ...rest };
};
