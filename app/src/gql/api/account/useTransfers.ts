import { gql } from '@apollo/client';
import { AccountId, Transfer } from './types';
import { useSuspenseQuery } from '~/gql/util';
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
  query Transfers($account: Address!, $direction: TransferDirection) {
    account(id: $account) {
      transfers(direction: $direction) {
        id
        token
        from
        to
        amount
        timestamp
      }
    }
  }
`;

export const useTransfers = (account: AccountId, direction?: TransferDirection) => {
  const query = useSuspenseQuery<TransfersQuery, TransfersQueryVariables>(TransfersDocument, {
    variables: {
      account,
      direction,
    },
  });

  return useMemo(
    (): Transfer[] =>
      (query.data.account?.transfers ?? []).map((t) => ({
        direction: direction || (account === t.from ? 'OUT' : 'IN'),
        token: asAddress(t.token),
        from: asAddress(t.from),
        to: asAddress(t.to),
        amount: BigInt(t.amount),
        timestamp: DateTime.fromISO(t.timestamp),
      })),
    [query.data],
  );
};
