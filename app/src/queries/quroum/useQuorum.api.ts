import { gql } from '@apollo/client';
import assert from 'assert';
import { QuorumGuid } from 'lib';
import { useMemo } from 'react';
import { QuorumQuery, QuorumQueryVariables, QuorumDocument } from '~/gql/generated.api';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { CombinedQuorum } from '.';

gql`
  fragment QuorumStateFields on QuorumState {
    proposalId
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

export const useQuorum = <Id extends QuorumGuid | undefined>(id: Id) => {
  const { data, ...rest } = useSuspenseQuery<QuorumQuery, QuorumQueryVariables>(QuorumDocument, {
    variables: { account: id?.account, key: id?.key },
    skip: id === undefined,
  });
  usePollWhenFocussed(rest, 30);

  const quorum = useMemo(
    () => (data.quorum ? CombinedQuorum.fromFragment(data.quorum) : undefined),
    [data.quorum],
  );

  if (id) assert(quorum);
  return quorum as Id extends QuorumGuid ? CombinedQuorum : undefined;
};
