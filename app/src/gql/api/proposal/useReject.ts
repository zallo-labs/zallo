import { gql } from '@apollo/client';
import {
  ApprovalFieldsFragmentDoc,
  RejectionFieldsFragmentDoc,
  SatisfiablePolicyFieldsFragmentDoc,
  TransactionFieldsFragmentDoc,
  useRejectMutation,
} from '@api/generated';
import { useCallback } from 'react';
import { Proposal } from './types';
import { useApprover } from '@network/useApprover';
import { DateTime } from 'luxon';
import { Address } from 'lib';

gql`
  ${ApprovalFieldsFragmentDoc}
  ${RejectionFieldsFragmentDoc}
  ${SatisfiablePolicyFieldsFragmentDoc}

  mutation Reject($input: ProposalInput!) {
    reject(input: $input) {
      id
      approvals {
        ...ApprovalFields
      }
      rejections {
        ...RejectionFields
      }
      satisfiablePolicies {
        ...SatisfiablePolicyFields
      }
    }
  }
`;

export const useReject = () => {
  const [mutation] = useRejectMutation();
  const approver = useApprover();

  const reject = useCallback(
    async (p: Proposal) =>
      mutation({
        variables: {
          input: { hash: p.hash },
        },
        optimisticResponse: {
          reject: {
            __typename: 'TransactionProposal',
            id: p.id,
            approvals: [...p.approvals.values()].map((a) => ({
              __typename: 'Approval' as const,
              id: a.id,
              user: {
                __typename: 'User' as const,
                address: a.user,
              },
              createdAt: a.timestamp.toISO()!,
            })),
            rejections: [
              ...[...p.rejections.values()].map((r) => ({
                __typename: 'Rejection' as const,
                id: r.user,
                user: {
                  __typename: 'User' as const,
                  address: r.user as Address,
                },
                createdAt: r.timestamp.toISO()!,
              })),
              {
                __typename: 'Rejection' as const,
                id: approver.address, // Incorrect but it doesn't matter
                user: {
                  __typename: 'User' as const,
                  address: approver.address as Address,
                },
                createdAt: DateTime.now().toISO()!,
              },
            ],
            satisfiablePolicies: p.satisfiablePolicies.map((p) => ({
              __typename: 'SatisfiablePolicy' as const,
              key: p.key,
              satisfied: p.satisfied,
              responseRequested: p.responseRequested,
            })),
          },
        },
      }),
    [mutation, approver.address],
  );

  return reject;
};
