import { Proposal, useApprove, useReject } from '@api/proposal';
import { useApproverId } from '@network/useApprover';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';

export interface ApprovalActionsProps {
  proposal: Proposal;
}

export const ApprovalActions = ({ proposal }: ApprovalActionsProps) => {
  const approver = useApproverId();
  const policy = proposal.policy;
  const approve = useApprove();
  const reject = useReject();

  if (proposal.state !== 'pending') return null;

  const canReject =
    proposal.state === 'pending' &&
    (policy?.requiresUserAction || proposal.approvals.has(approver));

  const canApprove = policy?.requiresUserAction || proposal.rejections.has(approver);

  return (
    <Actions>
      {canReject && <Button onPress={() => reject(proposal)}>Reject</Button>}

      {canApprove && (
        <Button mode="contained" onPress={() => approve(proposal)}>
          Approve
        </Button>
      )}
    </Actions>
  );
};
