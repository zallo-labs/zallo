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

  fragment OperationFields on Operation {
    to
    value
    data
    function {
      __typename
      ... on GenericOp {
        _name
        _args
      }
      ... on AddPolicyOp {
        account
        key
      }
      ... on RemovePolicyOp {
        account
        key
      }
      ... on TransferOp {
        token
        to
        amount
      }
      ... on TransferFromOp {
        token
        from
        to
        amount
      }
      ... on TransferApprovalOp {
        token
        spender
        amount
      }
      ... on SwapOp {
        fromToken
        fromAmount
        toToken
        minimumToAmount
        deadline
      }
    }
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
      ...OperationFields
    }
    label
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
