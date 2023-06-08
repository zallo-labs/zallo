import { gql } from '@apollo/client';
import assert from 'assert';
import { useMemo } from 'react';
import { ProposalDocument, ProposalQuery, ProposalQueryVariables } from '@api/generated';
import { useSuspenseQuery } from '~/gql/util';
import { Proposal, ProposalId, toProposal } from './types';

gql`
  fragment ApprovalFields on Approval {
    id
    user {
      address
    }
    createdAt
  }

  fragment RejectionFields on Rejection {
    id
    user {
      address
    }
    createdAt
  }

  fragment TransactionFields on Transaction {
    id
    hash
    gasPrice
    submittedAt
    receipt {
      success
      response
      gasUsed
      fee
      timestamp
      transfers {
        id
        direction
        token
        from
        to
        amount
      }
    }
  }

  fragment SatisfiablePolicyFields on SatisfiablePolicy {
    key
    satisfied
    responseRequested
  }

  fragment TransactionProposalFields on TransactionProposal {
    id
    hash
    account {
      address
    }
    proposedBy {
      address
    }
    operations {
      to
      value
      data
    }
    nonce
    gasLimit
    feeToken
    createdAt
    approvals {
      ...ApprovalFields
    }
    rejections {
      ...RejectionFields
    }
    policy {
      key
    }
    satisfiablePolicies {
      ...SatisfiablePolicyFields
    }
    simulation {
      transfers {
        id
        direction
        token
        from
        to
        amount
      }
    }
    transaction {
      ...TransactionFields
    }
  }

  query Proposal($input: ProposalInput!) {
    proposal(input: $input) {
      ...TransactionProposalFields
    }
  }
`;

export const useProposal = <Id extends ProposalId | undefined>(id: Id) => {
  const { data } = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, {
    variables: {
      input: { hash: id! },
    },
    skip: !id,
  });

  const p = data.proposal;
  const proposal = useMemo((): Proposal | undefined => (p ? toProposal(p) : undefined), [p]);

  if (id) assert(p, 'Proposal not found');
  return proposal as Id extends undefined ? Proposal | undefined : Proposal;
};
