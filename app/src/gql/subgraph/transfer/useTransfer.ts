import { gql } from '@apollo/client';
import { useMaybeToken } from '@token/useToken';
import assert from 'assert';
import { asAddress, Id, tryAsAddress } from 'lib';
import { useMemo } from 'react';
import { TransferDocument, TransferQuery, TransferQueryVariables } from '@subgraph/generated';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { dateTimeFromSubgraph } from '~/gql/subgraph/util';
import { useSuspenseQuery } from '~/gql/util';
import { Transfer } from './types';

gql`
  fragment TransferFields on Transfer {
    id
    type
    token
    from
    to
    value
    timestamp
  }

  query Transfer($id: ID!) {
    transfer(id: $id) {
      ...TransferFields
    }
  }
`;

export const useTransfer = (id: Id) => {
  const { data } = useSuspenseQuery<TransferQuery, TransferQueryVariables>(TransferDocument, {
    client: useSubgraphClient(),
    variables: { id },
  });

  const t = data.transfer;
  assert(t, "transfer doesn't exist");

  const token = useMaybeToken(tryAsAddress(t?.token));
  assert(token, 'token not found for transfer');

  return useMemo(
    (): Transfer => ({
      token,
      from: asAddress(t.from),
      to: asAddress(t.to),
      amount: BigInt(t.value),
      direction: t.type,
      timestamp: dateTimeFromSubgraph(t.timestamp),
    }),
    [t, token],
  );
};
