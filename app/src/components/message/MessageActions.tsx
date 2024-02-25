import { FragmentType, gql, useFragment } from '@api/generated';
import { Actions } from '#/layout/Actions';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { Button } from '../Button';
import { useSideSheet } from '#/SideSheet/SideSheetLayout';

const Message = gql(/* GraphQL */ `
  fragment MessageActions_Message on Message {
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
  proposal: FragmentType<typeof Message>;
  user: FragmentType<typeof User>;
}

export function MessageActions(props: MessageActionsProps) {
  const p = useFragment(Message, props.proposal);
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
