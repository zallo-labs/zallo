import { gql } from '@apollo/client';
import { Token } from '@token/token';
import { useMaybeToken } from '@token/useToken';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { Address, address, Id } from 'lib';
import { useMemo } from 'react';
import {
  TransferDocument,
  TransferQuery,
  TransferQueryVariables,
  TransferType,
} from '~/gql/generated.sub';
import { useSubgraphClient } from '~/gql/GqlProvider';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface Transfer {
  token: Token;
  from: Address;
  to: Address;
  amount: BigNumber;
  direction: TransferType;
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
    }
  }
`;

export const useTransfer = (id: Id) => {
  const { data, ...rest } = useSuspenseQuery<
    TransferQuery,
    TransferQueryVariables
  >(TransferDocument, {
    client: useSubgraphClient(),
    variables: { id },
  });

  const t = data.transfer!;

  const token = useMaybeToken(address(t.token));
  assert(token, 'token not found for transfer');

  const transfer = useMemo(
    (): Transfer => ({
      token,
      from: address(t.from),
      to: address(t.to),
      amount: BigNumber.from(t.value),
      direction: t.type,
    }),
    [t, token],
  );

  return [transfer, rest] as const;
};
