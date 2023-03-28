import { gql } from '@apollo/client';
import { asHex, signTx } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { Proposal } from './types';
import {
  ApprovalFieldsFragmentDoc,
  TransactionFieldsFragmentDoc,
  useApproveMutation,
} from '@api/generated';
import { useApprover } from '@network/useApprover';

gql`
  ${ApprovalFieldsFragmentDoc}
  ${TransactionFieldsFragmentDoc}

  mutation Approve($id: Bytes32!, $signature: Bytes!) {
    approve(id: $id, signature: $signature) {
      id
      approvals {
        ...ApprovalFields
      }
      rejections {
        ...RejectionFields
      }
      transaction {
        ...TransactionFields
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

      const r = await mutate({
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
                createdAt: a.timestamp.toISO(),
              })),
              {
                __typename: 'Approval' as const,
                userId: approver.address,
                signature,
                createdAt: DateTime.now().toISO(),
              },
            ],
            rejections: [...p.rejections]
              .filter((r) => r.approver !== approver.address)
              .map((r) => ({
                __typename: 'Rejection' as const,
                userId: r.approver,
                createdAt: r.timestamp.toISO(),
              })),
            transaction: p.transaction
              ? {
                  __typename: 'Transaction',
                  id: p.transaction.hash,
                  hash: p.transaction.hash,
                  gasLimit: p.transaction.gasLimit.toString(),
                  gasPrice: p.transaction.gasPrice?.toString(),
                  createdAt: p.transaction.timestamp.toISO(),
                  response: p.transaction.response
                    ? {
                        __typename: 'TransactionResponse',
                        success: p.transaction.response.success,
                        response: p.transaction.response.response,
                        timestamp: p.transaction.response.timestamp.toISO(),
                      }
                    : null,
                }
              : null,
          },
        },
      });

      const h = r.data?.approve.transaction?.hash;
      return { transactionHash: h ? asHex(h) : undefined };
    },
    [approver, mutate],
  );

  return approve;
};
