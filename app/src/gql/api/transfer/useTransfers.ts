import { gql } from '@apollo/client';
import { Transfer } from './types';
import { usePollWhenFocussed, useSuspenseQuery } from '~/gql/util';
import {
  TransferDirection,
  TransfersDocument,
  TransfersQuery,
  TransfersQueryVariables,
} from '@api/generated';
import { Address, asBigInt } from 'lib';
import { useMemo } from 'react';
import { DateTime } from 'luxon';

gql`
  query Transfers($input: TransfersInput!) {
    transfers(input: $input) {
      id
      direction
      from
      to
      token
      amount
      timestamp
    }
  }
`;

export const useTransfers = (account: Address, direction?: TransferDirection) => {
  const { data, ...rest } = useSuspenseQuery<TransfersQuery, TransfersQueryVariables>(
    TransfersDocument,
    {
      variables: {
        input: {
          accounts: [account],
          direction,
        },
      },
    },
  );
  usePollWhenFocussed(rest, 10);

  return useMemo(
    (): Transfer[] =>
      data.transfers.map((t) => ({
        id: t.id,
        direction: t.direction,
        token: t.token,
        from: t.from,
        to: t.to,
        amount: asBigInt(t.amount),
        timestamp: DateTime.fromISO(t.timestamp),
      })),
    [data],
  );
};
