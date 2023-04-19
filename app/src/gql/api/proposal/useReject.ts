import { gql } from '@apollo/client';
import { RejectionFieldsFragmentDoc, useRejectMutation } from '@api/generated';
import { useCallback } from 'react';
import { Proposal } from './types';
import { useApprover } from '@network/useApprover';
import { DateTime } from 'luxon';

gql`
  ${RejectionFieldsFragmentDoc}

  mutation Reject($id: Bytes32!) {
    reject(id: $id) {
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
    async ({ id, rejections }: Proposal) =>
      mutation({
        variables: { id },
        optimisticResponse: {
          reject: {
            __typename: 'Proposal',
            id,
            rejections: [
              ...[...rejections.values()].map((a) => ({
                __typename: 'Rejection' as const,
                userId: a.approver,
                createdAt: a.timestamp.toISO(),
              })),
              {
                __typename: 'Rejection' as const,
                userId: approver.address,
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
