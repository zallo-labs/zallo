import { gql } from '@apollo/client';
import { Address, asHex, signTx } from 'lib';
import { DateTime } from 'luxon';
import { useCallback } from 'react';
import { Proposal } from './types';
import {
  ApprovalFieldsFragmentDoc,
  RejectionFieldsFragmentDoc,
  SatisfiablePolicyFieldsFragmentDoc,
  TransactionFieldsFragmentDoc,
  useApproveMutation,
} from '@api/generated';
import { useApprover } from '@network/useApprover';
import { authenticate, useAuthSettings } from '~/provider/AuthGate';
import { showError } from '~/provider/SnackbarProvider';

gql`
  ${ApprovalFieldsFragmentDoc}
  ${RejectionFieldsFragmentDoc}
  ${SatisfiablePolicyFieldsFragmentDoc}
  ${TransactionFieldsFragmentDoc}

  mutation Approve($input: ApproveInput!) {
    approve(input: $input) {
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
      transaction {
        ...TransactionFields
      }
    }
  }
`;

export const useApprove = () => {
  const [mutate] = useApproveMutation();
  const approver = useApprover();
  const { require: authRequired } = useAuthSettings();

  const approve = useCallback(
    async (p: Proposal) => {
      const signature = await signTx(approver, p.account, p);

      if (authRequired && !(await authenticate({ promptMessage: 'Authenticate to approve' }))) {
        showError('Authentication is required for approval');
        return;
      }

      const r = await mutate({
        variables: {
          input: {
            hash: p.hash,
            signature,
          },
        },
        optimisticResponse: {
          approve: {
            __typename: 'TransactionProposal',
            id: p.id,
            approvals: [
              ...[...p.approvals.values()].map((a) => ({
                __typename: 'Approval' as const,
                id: a.id,
                user: {
                  __typename: 'User' as const,
                  address: a.user,
                },
                createdAt: a.timestamp.toISO(),
              })),
              {
                __typename: 'Approval' as const,
                id: approver.address, // Incorrect but it doesn't matter
                user: {
                  __typename: 'User' as const,
                  address: approver.address as Address,
                },
                createdAt: DateTime.now().toISO(),
              },
            ],
            rejections: [...p.rejections]
              .filter((r) => r.user !== approver.address)
              .map((r) => ({
                __typename: 'Rejection' as const,
                id: r.id,
                user: {
                  __typename: 'User' as const,
                  address: r.user,
                },
                createdAt: r.timestamp.toISO(),
              })),
            satisfiablePolicies: p.satisfiablePolicies.map((p) => ({
              __typename: 'SatisfiablePolicy' as const,
              key: p.key,
              satisfied: p.satisfied,
              responseRequested: p.responseRequested,
            })),
            transaction: p.transaction
              ? {
                  __typename: 'Transaction',
                  id: p.transaction.id,
                  hash: p.transaction.hash,
                  gasPrice: p.transaction.gasPrice.toString(),
                  submittedAt: p.transaction.timestamp.toISO(),
                  receipt: p.transaction.receipt
                    ? {
                        __typename: 'Receipt',
                        success: p.transaction.receipt.success,
                        response: p.transaction.receipt.response,
                        transfers: p.transaction.receipt.transfers.map((t) => ({
                          __typename: 'Transfer' as const,
                          id: t.id,
                          direction: t.direction,
                          from: t.from,
                          to: t.to,
                          token: t.token,
                          amount: t.amount.toString(),
                        })),
                        gasUsed: p.transaction.receipt.gasUsed.toString(),
                        fee: p.transaction.receipt.fee.toString(),
                        timestamp: p.transaction.receipt.timestamp.toISO(),
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
