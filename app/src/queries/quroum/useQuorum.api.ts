import { gql } from '@apollo/client';
import assert from 'assert';
import { Address, QuorumGuid } from 'lib';
import { useMemo } from 'react';
import { CombinedQuorum } from '.';
import { useAccount } from '../account/useAccount.api';

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
`;

export const useQuorum = <Id extends QuorumGuid | undefined>(id: Id) => {
  const account = useAccount(id?.account as Id extends undefined ? Address | undefined : Address);

  const quorum = useMemo(
    () => (id ? account?.quorums.find((q) => q.key === id?.key) : undefined),
    [account?.quorums, id],
  );

  if (id) assert(quorum);
  return quorum as Id extends QuorumGuid ? CombinedQuorum : undefined;
};
