import { Operation, asBigInt, signTx } from 'lib';
import { useCallback } from 'react';
import { useApproverWallet } from '@network/useApprover';
import { authenticate, useAuthSettings } from '~/provider/AuthGate';
import { showError } from '~/provider/SnackbarProvider';
import { gql, useFragment as getFragment, FragmentType } from '@api/generated';
import { useMutation } from 'urql';

const TransactionProposalFragmentDoc = gql(/* GraphQL */ `
  fragment UseApprove_TransactionProposalFragment on TransactionProposal {
    id
    hash
    account {
      id
      address
    }
    operations {
      to
      value
      data
    }
    nonce
    gasLimit
  }
`);

const Approve = gql(/* GraphQL */ `
  mutation ApproveProposal($input: ApproveInput!) {
    approve(input: $input) {
      id
      approvals {
        id
      }
      rejections {
        id
      }
    }
  }
`);

export const useApprove = () => {
  const mutate = useMutation(Approve)[1];
  const approver = useApproverWallet();
  const { approval: authRequired } = useAuthSettings();

  const approve = useCallback(
    async (proposal: FragmentType<typeof TransactionProposalFragmentDoc>) => {
      const p = getFragment(TransactionProposalFragmentDoc, proposal);

      const signature = await signTx(approver, p.account.address, {
        operations: p.operations.map(
          (op): Operation => ({
            to: op.to,
            value: asBigInt(op.value),
            data: op.data || undefined,
          }),
        ) as [Operation, ...Operation[]],
        nonce: asBigInt(p.nonce),
        gasLimit: asBigInt(p.gasLimit),
      });

      if (authRequired && !(await authenticate({ promptMessage: 'Authenticate to approve' }))) {
        showError('Authentication is required for approval');
        return;
      }

      return mutate({
        input: {
          hash: p.hash,
          signature,
        },
      });
    },
    [approver, authRequired, mutate],
  );

  return approve;
};
