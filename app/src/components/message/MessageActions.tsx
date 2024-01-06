import { Button } from 'react-native-paper';

import { Actions } from '~/components/layout/Actions';
import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';
import { useApproverAddress } from '~/lib/network/useApprover';

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
  const approver = useApproverAddress();
  const approve = useApprove({ proposal: p, user, approver });
  const reject = useReject({ proposal: p, user, approver });

  return (
    <Actions flex={false}>
      {reject && <Button onPress={reject}>Reject</Button>}

      {approve && (
        <Button mode="contained" onPress={approve}>
          Approve
        </Button>
      )}
    </Actions>
  );
}
