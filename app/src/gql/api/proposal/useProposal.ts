import { gql } from '@apollo/client';
import assert from 'assert';
import { useMemo } from 'react';
import { ProposalDocument, ProposalQuery, ProposalQueryVariables } from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';
import { Proposal, ProposalId, toProposal } from './types';
import { useProposalSubscription } from './useProposalSubscription';

gql`
  fragment ApprovalFields on Approval {
    userId
    signature
    createdAt
  }

  fragment RejectionFields on Rejection {
    userId
    createdAt
  }

  fragment TransactionFields on Transaction {
    id
    hash
    gasLimit
    gasPrice
    createdAt
    response {
      success
      response
      gasUsed
      gasPrice
      timestamp
    }
  }

  fragment ProposalFields on Proposal {
    id
    accountId
    proposerId
    to
    value
    data
    nonce
    gasLimit
    estimatedOpGas
    feeToken
    createdAt
    approvals {
      ...ApprovalFields
    }
    rejections {
      ...RejectionFields
    }
    satisfiablePolicies {
      id
      key
      satisfied
      requiresUserAction
    }
    transaction {
      ...TransactionFields
    }
  }

  query Proposal($id: Bytes32!) {
    proposal(id: $id) {
      ...ProposalFields
    }
  }
`;

export const useProposal = <Id extends ProposalId | undefined>(id: Id) => {
  const skip = !id;
  const { data } = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, {
    variables: { id },
    skip,
  });
  useProposalSubscription({ proposals: id, skip });

  const p = data.proposal;
  const proposal = useMemo((): Proposal | undefined => (p ? toProposal(p) : undefined), [p]);

  if (id) assert(p, 'Proposal not found');
  return proposal as Id extends undefined ? Proposal | undefined : Proposal;
};
