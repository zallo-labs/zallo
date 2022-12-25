import { gql } from '@apollo/client';
import assert from 'assert';
import { BigNumber } from 'ethers';
import {
  address,
  Address,
  Quorum,
  QuorumGuid,
  QuorumKey,
  TokenLimit,
  TokenLimitPeriod,
  toQuorumKey,
} from 'lib';
import { useMemo } from 'react';
import {
  QuorumQuery,
  QuorumQueryVariables,
  QuorumDocument,
  QuorumStateFieldsFragment,
  QuorumFieldsFragment,
} from '~/gql/generated.api';
import { Proposable2, ProposedValue } from '~/gql/proposable2';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export class CombinedQuorum extends Proposable2<Quorum> implements QuorumGuid {
  constructor(
    public account: Address,
    public key: QuorumKey,
    public name?: string,
    ...params: ConstructorParameters<typeof Proposable2<Quorum>>
  ) {
    super(...params);
  }
}

gql`
  fragment QuorumStateFields on QuorumState {
    isRemoved
    createdAt
    approvers {
      userId
    }
    spendingFallback
    limits {
      token
      amount
      period
    }
  }

  fragment QuorumFields on Quorum {
    id
    accountId
    key
    name
    activeState {
      ...QuorumStateFields
    }
    proposedStates {
      ...QuorumStateFields
    }
  }

  query Quorum($account: Address!, $key: QuorumKey!) {
    quorum(account: $account, key: $key) {
      ...QuorumFields
    }
  }
`;

const fromState = (id: QuorumGuid, state: QuorumStateFieldsFragment): ProposedValue<Quorum> => ({
  value: {
    key: id.key,
    approvers: new Set(state.approvers?.map((a) => address(a.userId))),
    spending: {
      fallback: state.spendingFallback,
      limit: Object.fromEntries(
        state.limits?.map((l): [Address, TokenLimit] => [
          address(l.token),
          {
            token: address(l.token),
            amount: BigNumber.from(l.amount),
            period: l.period as TokenLimitPeriod,
          },
        ]) ?? [],
      ),
    },
  },
});

export const toCombinedQuorum = (q: QuorumFieldsFragment): CombinedQuorum => {
  const id: QuorumGuid = {
    account: address(q.accountId),
    key: toQuorumKey(q.key),
  };

  return new CombinedQuorum(
    id.account,
    id.key,
    q.name || undefined,
    q.activeState ? fromState(id, q.activeState) : undefined,
    q.proposedStates.map((s) => fromState(id, s)),
  );
};

export const useQuorum = <Id extends QuorumGuid | undefined>(id: Id) => {
  const { data, ...rest } = useSuspenseQuery<QuorumQuery, QuorumQueryVariables>(QuorumDocument, {
    variables: { account: id?.account, key: id?.key },
    skip: !id,
  });
  usePollWhenFocussed(rest, 30);

  const quorum = useMemo(
    () => (data.quorum ? toCombinedQuorum(data.quorum) : undefined),
    [data.quorum],
  );

  if (id) assert(quorum);
  return quorum as Id extends QuorumGuid ? CombinedQuorum : undefined;
};
