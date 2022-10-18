import {
  SendIcon,
  CancelIcon,
  CheckIcon,
  QuorumIcon,
} from '~/util/theme/icons';
import { memo, useState } from 'react';
import { Button } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useExecute } from '~/mutations/proposal/execute/useExecute';
import { useApprove } from '~/mutations/proposal/approve/useApprove.api';
import { Actions } from './Actions';
import { useTransactionIsApproved } from './useTransactionIsApproved';
import { useRevokeApproval } from '~/mutations/proposal/approve/useRevokeApproval.api';
import { useExecutionProhibited } from './useExecutionProhibited';
import { useTxContext } from '../TransactionProvider';

export const ProposeActions = memo(() => {
  const { proposal, proposer, onExecute } = useTxContext();

  const isApproved = useTransactionIsApproved(proposal, proposer);
  const approve = useApprove();
  const revoke = useRevokeApproval();
  const execute = useExecute(proposer, proposal);
  const goBack = useGoBack();
  const executionProhibited = useExecutionProhibited();

  const [submitting, setSubmitting] = useState(false);

  return (
    <Actions>
      {!proposal.userHasApproved && !isApproved && (
        <Button
          mode="contained"
          icon={CheckIcon}
          onPress={() => approve(proposal)}
        >
          Approve
        </Button>
      )}

      {proposal.userHasApproved && !isApproved && (
        <Button
          mode="contained"
          icon={QuorumIcon}
          onPress={() => {
            // TODO: select quorum (part of the wallet) to notify
          }}
        >
          Request
        </Button>
      )}

      {isApproved && (
        <Button
          mode="contained"
          icon={SendIcon}
          loading={submitting}
          disabled={!!executionProhibited}
          onPress={async () => {
            setSubmitting(true);
            const resp = await execute();
            await onExecute?.(resp);
            setSubmitting(false);
          }}
        >
          Execute
        </Button>
      )}

      {proposal.userHasApproved && (
        <Button
          mode="contained-tonal"
          icon={CancelIcon}
          disabled={submitting}
          onPress={async () => {
            const willBeDeleted = proposal.approvals.length === 1;
            revoke(proposal);
            if (willBeDeleted) goBack();
          }}
        >
          Revoke
        </Button>
      )}
    </Actions>
  );
});
