import { gql } from '@apollo/client';
import { Token } from '@token/token';
import { useMaybeToken } from '@token/useToken';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { Address, asAddress, Id } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  TransferDocument,
  TransferQuery,
  TransferQueryVariables,
  TransferType,
} from '~/gql/generated.sub';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { dateTimeFromSubgraph } from '~/gql/subgraphUtil';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface Transfer {
  token: Token;
  from: Address;
  to: Address;
  amount: BigNumber;
  direction: TransferType;
  timestamp: DateTime;
}

gql`
  query Transfer($id: ID!) {
    transfer(id: $id) {
      id
      type
      token
      from
      to
      value
      timestamp
    }
  }
`;

export const useTransfer = (id: Id) => {
  const { data } = useSuspenseQuery<TransferQuery, TransferQueryVariables>(TransferDocument, {
    client: useSubgraphClient(),
    variables: { id },
  });

  const t = data.transfer!;

  const token = useMaybeToken(asAddress(t.token));
  assert(token, 'token not found for transfer');

  return useMemo(
    (): Transfer => ({
      token,
      from: asAddress(t.from),
      to: asAddress(t.to),
      amount: BigNumber.from(t.value),
      direction: t.type,
      timestamp: dateTimeFromSubgraph(t.timestamp),
    }),
    [t, token],
  );
};
