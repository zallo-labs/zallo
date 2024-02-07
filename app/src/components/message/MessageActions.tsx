import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '~/lib/network/useApprover';
import { Actions } from '#/layout/Actions';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { Button } from '../Button';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageActions_MessageProposal on MessageProposal {
    ...UseApprove_Proposal
    ...UseReject_Proposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageActions_User on User {
    ...UseApprove_User
    ...UseReject_User
  }
`);

export interface MessageActionsProps {
  proposal: FragmentType<typeof MessageProposal>;
  user: FragmentType<typeof User>;
  approvalsSheet: {
    visible: boolean;
    open: () => void;
  };
}

export function MessageActions(props: MessageActionsProps) {
  const p = useFragment(MessageProposal, props.proposal);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const approve = useApprove({ proposal: p, user, approver });
  const reject = useReject({ proposal: p, user, approver });

  return (
    <Actions>
      {reject && <Button onPress={reject}>Reject</Button>}

      {!props.approvalsSheet.open && (
        <Button mode="contained-tonal" icon="menu-open" onPress={props.approvalsSheet.open}>
          View approvals
        </Button>
      )}

      {approve && (
        <Button mode="contained" onPress={approve}>
          Approve
        </Button>
      )}
    </Actions>
  );
}
