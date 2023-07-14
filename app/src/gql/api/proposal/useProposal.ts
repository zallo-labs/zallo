import { useSuspenseQuery } from '@apollo/client';
import assert from 'assert';
import { useMemo } from 'react';
import { Proposal, toProposal } from './types';
import { Hex } from 'lib';
import { gql } from '@api/gen';
import { ProposalQuery, ProposalQueryVariables } from '@api/generated';

gql(/* GraphQL */ `
  fragment ApprovalFields on Approval {
    id
    approver {
      address
    }
    createdAt
  }

  fragment RejectionFields on Rejection {
    id
    approver {
      address
    }
    createdAt
  }

  fragment TransferFields on Transfer {
    id
    direction
    token
    from
    to
    amount
    timestamp
  }

  fragment TransferApprovalFields on TransferApproval {
    id
    direction
    token
    from
    to
    amount
    timestamp
  }

  fragment TransactionFields on Transaction {
    id
    hash
    gasPrice
    submittedAt
    receipt {
      success
      responses
      gasUsed
      fee
      timestamp
      # Broken due to Apollo cache interface bug - // https://github.com/apollographql/apollo-client/issues/8898
      # events {
      #   ... on Transferlike {
      #     id
      #     direction
      #     token
      #     from
      #     to
      #     amount
      #     timestamp
      #   }
      # }
      transferEvents {
        ...TransferFields
      }
      transferApprovalEvents {
        ...TransferApprovalFields
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
`);

const ProposalDoc = gql(/* GraphQL */ `
  query Proposal($input: ProposalInput!) {
    proposal(input: $input) {
      ...TransactionProposalFields
    }
  }
`);

export const useProposal = <Hash extends Hex | undefined>(hash: Hash) => {
  const { data } = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(ProposalDoc, {
    variables: { input: { hash: hash! } },
    skip: !hash,
  });

  const p = data?.proposal;
  const proposal = useMemo((): Proposal | undefined => (p ? toProposal(p) : undefined), [p]);

  if (hash) assert(p, 'Proposal not found');
  return proposal as Hash extends undefined ? Proposal | undefined : Proposal;
};
