import { SendIcon, CancelIcon, CheckIcon, QuorumIcon } from '~/util/theme/icons';
import { memo, useState } from 'react';
import { Button } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useExecute } from '~/mutations/proposal/execute/useExecute';
import { useApprove } from '~/mutations/proposal/approve/useApprove.api';
import { Actions } from './Actions';
import { useExecutionProhibited } from '../useExecutionProhibited';
import { useTxContext } from '../../TransactionProvider';

import { useRequestApproval } from '~/mutations/proposal/useRequestApproval.api';
import { useTransactionApprovers, useTransactionIsApproved } from '../useTransactionApprovers';
import { useReject } from '~/mutations/proposal/approve/useReject.api';

export const ProposeActions = memo(() => {
  const { proposal, proposer, onExecute } = useTxContext();

  const isApproved = useTransactionIsApproved(proposal);
  const approvers = useTransactionApprovers(proposal);
  const approve = useApprove();
  const reject = useReject();
  const execute = useExecute(proposer, proposal);
  const goBack = useGoBack();
  const requestApproval = useRequestApproval();
  const executionProhibited = useExecutionProhibited();

  const [submitting, setSubmitting] = useState(false);

  return (
    <Actions>
      {!proposal.userHasApproved && !isApproved && (
        <Button mode="contained" icon={CheckIcon} onPress={() => approve(proposal)}>
          Approve
        </Button>
      )}

      {proposal.userHasApproved && !isApproved && (
        <Button
          mode="contained"
          icon={QuorumIcon}
          onPress={() => requestApproval(proposal, approvers.notApproved)}
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
            const { removed } = await reject(proposal);
            if (removed) goBack();
          }}
        >
          Revoke
        </Button>
      )}
    </Actions>
  );
});
