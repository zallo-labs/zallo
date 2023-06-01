import { Proposal, useApprove, useReject } from '@api/proposal';
import { useApproverId } from '@network/useApprover';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { CHAIN } from '@network/provider';
import { RetryIcon, ShareIcon } from '@theme/icons';
import { Share } from 'react-native';
import { useExecute } from '@api/transaction/useExecute';

export interface ProposalActionsProps {
  proposal: Proposal;
}

export const ProposalActions = ({ proposal }: ProposalActionsProps) => {
  const approver = useApproverId();
  const policy = proposal.policy;
  const approve = useApprove();
  const reject = useReject();
  const execute = useExecute();

  const canReject =
    proposal.state === 'pending' && (policy?.responseRequested || proposal.approvals.has(approver));

  const canApprove =
    proposal.state === 'pending' &&
    (policy?.responseRequested || proposal.rejections.has(approver));

  return (
    <Actions style={{ flexGrow: 0 }}>
      {canReject && <Button onPress={() => reject(proposal)}>Reject</Button>}

      {canApprove && (
        <Button mode="contained" onPress={() => approve(proposal)}>
          Approve
        </Button>
      )}

      {proposal.transaction && (
        <Button
          mode="contained-tonal"
          icon={ShareIcon}
          onPress={() => {
            const url = `${CHAIN.explorer}/tx/${proposal.transaction!.hash}`;
            Share.share({ message: url, url });
          }}
        >
          Share receipt
        </Button>
      )}

      {proposal.transaction?.status === 'failure' && (
        <Button
          mode="contained"
          icon={RetryIcon}
          onPress={() => execute({ proposalHash: proposal.hash })}
        >
          Retry
        </Button>
      )}
    </Actions>
  );
};
