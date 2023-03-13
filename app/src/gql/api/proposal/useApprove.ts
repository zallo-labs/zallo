import { gql } from '@apollo/client';
import { signTx } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { Proposal } from '~/gql/api/proposal/types';
import { ApprovalFieldsFragmentDoc, useApproveMutation } from '@api/generated';
import { useApprover } from '@network/useApprover';

gql`
  ${ApprovalFieldsFragmentDoc}

  mutation Approve($id: Bytes32!, $signature: Bytes!) {
    approve(id: $id, signature: $signature) {
      id
      approvals {
        ...ApprovalFields
      }
    }
  }
`;

export const useApprove = () => {
  const [mutate] = useApproveMutation();
  const approver = useApprover();

  const approve = useCallback(
    async (p: Proposal) => {
      const signature = await signTx(approver, p.account, p);

      return mutate({
        variables: {
          id: p.id,
          signature,
        },
        optimisticResponse: {
          approve: {
            __typename: 'Proposal',
            id: p.id,
            approvals: [
              ...[...p.approvals.values()].map((a) => ({
                __typename: 'Approval' as const,
                userId: a.approver,
                signature: a.signature,
                createdAt: a.timestamp,
              })),
              {
                __typename: 'Approval' as const,
                userId: approver.address,
                signature,
                createdAt: DateTime.now().toISO(),
              },
            ],
          },
        },
      });
    },
    [approver, mutate],
  );

  return approve;
};
