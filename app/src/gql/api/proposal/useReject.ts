import { gql } from '@apollo/client';
import { RejectionFieldsFragmentDoc, useRejectMutation } from '@api/generated';
import { useCallback } from 'react';
import { Proposal } from './types';
import { useApprover } from '@network/useApprover';
import { DateTime } from 'luxon';
import { Address } from 'lib';

gql`
  ${RejectionFieldsFragmentDoc}

  mutation Reject($input: ProposalInput!) {
    reject(input: $input) {
      id
      rejections {
        ...RejectionFields
      }
    }
  }
`;

export const useReject = () => {
  const [mutation] = useRejectMutation();
  const approver = useApprover();

  const reject = useCallback(
    async ({ hash: id, rejections }: Proposal) =>
      mutation({
        variables: {
          input: { hash: id },
        },
        optimisticResponse: {
          reject: {
            __typename: 'TransactionProposal',
            id,
            rejections: [
              ...[...rejections.values()].map((r) => ({
                __typename: 'Rejection' as const,
                id: r.user,
                user: {
                  __typename: 'User' as const,
                  address: r.user as Address,
                },
                createdAt: r.timestamp.toISO(),
              })),
              {
                __typename: 'Rejection' as const,
                id: approver.address, // Incorrect but it doesn't matter
                user: {
                  __typename: 'User' as const,
                  address: approver.address as Address,
                },
                createdAt: DateTime.now().toISO(),
              },
            ],
          },
        },
      }),
    [mutation, approver.address],
  );

  return reject;
};
