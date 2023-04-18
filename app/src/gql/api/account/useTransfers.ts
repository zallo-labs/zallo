import { gql } from '@apollo/client';
import { AccountId, Transfer } from './types';
import { usePollWhenFocussed, useSuspenseQuery } from '~/gql/util';
import {
  TransferDirection,
  TransfersDocument,
  TransfersQuery,
  TransfersQueryVariables,
} from '@api/generated';
import { asAddress } from 'lib';
import { useMemo } from 'react';
import { DateTime } from 'luxon';

gql`
  query Transfers($input: TransfersInput!) {
    transfers(input: $input) {
      id
      token
      from
      to
      amount
      timestamp
    }
  }
`;

export const useTransfers = (account: AccountId, direction?: TransferDirection) => {
  const { data, ...rest } = useSuspenseQuery<TransfersQuery, TransfersQueryVariables>(
    TransfersDocument,
    {
      variables: {
        input: {
          account,
          direction,
        },
      },
    },
  );
  usePollWhenFocussed(rest, 10);

  return useMemo(
    (): Transfer[] =>
      data.transfers.map((t) => ({
        direction: direction || (account === t.from ? 'OUT' : 'IN'),
        token: asAddress(t.token),
        from: asAddress(t.from),
        to: asAddress(t.to),
        amount: BigInt(t.amount),
        timestamp: DateTime.fromISO(t.timestamp),
      })),
    [data],
  );
};
