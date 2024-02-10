import { FragmentType, gql, useFragment } from '@api/generated';
import { Actions } from '#/layout/Actions';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { Button } from '../Button';
import { useSideSheet } from '#/SideSheet/SideSheetLayout';

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
}

export function MessageActions(props: MessageActionsProps) {
  const p = useFragment(MessageProposal, props.proposal);
  const user = useFragment(User, props.user);
  const approve = useApprove({ proposal: p, user });
  const reject = useReject({ proposal: p, user });
  const sheet = useSideSheet();

  return (
    <Actions>
      {reject && <Button onPress={reject}>Reject</Button>}

      {!sheet.visible && (
        <Button mode="contained-tonal" icon="menu-open" onPress={() => sheet.show(true)}>
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
