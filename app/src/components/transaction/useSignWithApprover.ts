import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { useApproverWallet } from '@network/useApprover';
import { asHex, signDigest } from 'lib';
import { ok, err } from 'neverthrow';
import { useCallback } from 'react';
import { match } from 'ts-pattern';
import { authenticate, useAuthSettings } from '~/components/provider/AuthGate';
import { showError } from '~/components/provider/SnackbarProvider';

type SignContent = PersonalMessage | TransactionProposalFragment;
type PersonalMessage = string;
type TransactionProposalFragment = FragmentType<typeof Proposal>;

const Proposal = gql(/* GraphQL */ `
  fragment UseSignWithApprover_Propsosal on Proposal {
    id
    hash
  }
`);

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
        .when(isTransactionProposal, (proposalFragment) =>
          signDigest(getFragment(Proposal, proposalFragment).hash, approver),
        )
        .exhaustive();

      return ok(signature);
    },
    [approver, authRequired],
  );
}
