import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useApproverWallet } from '@network/useApprover';
import { Operation, asBigInt, asHex, signTx } from 'lib';
import { ok, err } from 'neverthrow';
import { useCallback } from 'react';
import { match } from 'ts-pattern';
import { authenticate, useAuthSettings } from '~/provider/AuthGate';
import { showError } from '~/provider/SnackbarProvider';

type PersonalMessage = string;

type SignContent = PersonalMessage | TransactionProposalFragment;

const TransactionProposal = gql(/* GraphQL */ `
  fragment UseSignWithApprover_TransactionPropsosal on TransactionProposal {
    id
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
type TransactionProposalFragment = FragmentType<typeof TransactionProposal>;

const isMessageContent = (c: SignContent): c is PersonalMessage => typeof c === 'string';
const isTransactionProposal = (c: SignContent): c is TransactionProposalFragment =>
  typeof c === 'object';

export function useSignWithApprover() {
  const approver = useApproverWallet();
  const { approval: authRequired } = useAuthSettings();

  return useCallback(
    async (c: SignContent) => {
      if (authRequired && !(await authenticate({ promptMessage: 'Authenticate to approve' }))) {
        showError('Authentication is required for approval');
        return err('authentication-refused' as const);
      }

      const signature = await match(c)
        .when(isMessageContent, async (message) => asHex(await approver.signMessage(message)))
        .when(isTransactionProposal, (proposalFragment) => {
          const p = getFragment(TransactionProposal, proposalFragment);
          return signTx(approver, p.account.address, {
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
        })
        .exhaustive();

      return ok(signature);
    },
    [approver, authRequired],
  );
}
