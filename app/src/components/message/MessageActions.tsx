import { Actions } from '#/layout/Actions';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { Button } from '../Button';
import { useAtom } from 'jotai';
import { SIDE_SHEET } from '#/SideSheet/SideSheetLayout';
import { graphql } from 'relay-runtime';
import { MessageActions_message$key } from '~/api/__generated__/MessageActions_message.graphql';
import { MessageActions_user$key } from '~/api/__generated__/MessageActions_user.graphql';
import { useFragment } from 'react-relay';

const Message = graphql`
  fragment MessageActions_message on Message {
    ...useApprove_proposal
    ...useReject_proposal
  }
`;

const User = graphql`
  fragment MessageActions_user on User {
    ...useApprove_user
    ...useReject_user
  }
`;

export interface MessageActionsProps {
  message: MessageActions_message$key;
  user: MessageActions_user$key;
}

export function MessageActions(props: MessageActionsProps) {
  const p = useFragment(Message, props.message);
  const user = useFragment(User, props.user);
  const approve = useApprove({ proposal: p, user });
  const reject = useReject({ proposal: p, user });
  const [sheetVisible, showSheet] = useAtom(SIDE_SHEET);

  return (
    <Actions>
      {reject && <Button onPress={reject}>Reject</Button>}

      {!sheetVisible && (
        <Button mode="contained-tonal" icon="menu-open" onPress={() => showSheet(true)}>
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
