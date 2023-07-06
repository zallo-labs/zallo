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
import { useApproverWallet } from '@network/useApprover';
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
  const approver = useApproverWallet();
  const { approval: authRequired } = useAuthSettings();

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
                approver: {
                  __typename: 'Approver' as const,
                  address: a.approver,
                },
                createdAt: a.timestamp.toISO()!,
              })),
              {
                __typename: 'Approval' as const,
                id: approver.address, // Incorrect but it doesn't matter
                approver: {
                  __typename: 'Approver' as const,
                  address: approver.address as Address,
                },
                createdAt: DateTime.now().toISO()!,
              },
            ],
            rejections: [...p.rejections]
              .filter((r) => r.approver !== approver.address)
              .map((r) => ({
                __typename: 'Rejection' as const,
                id: r.id,
                approver: {
                  __typename: 'Approver' as const,
                  address: r.approver,
                },
                createdAt: r.timestamp.toISO()!,
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
                  submittedAt: p.transaction.timestamp.toISO()!,
                  receipt: p.transaction.receipt
                    ? {
                        __typename: 'Receipt',
                        success: p.transaction.receipt.success,
                        responses: p.transaction.receipt.responses,
                        events: p.transaction.receipt.events,
                        gasUsed: p.transaction.receipt.gasUsed.toString(),
                        fee: p.transaction.receipt.fee.toString(),
                        timestamp: p.transaction.receipt.timestamp.toISO()!,
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
