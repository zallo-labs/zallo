import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { Actions } from '~/components/layout/Actions';
import { Button } from 'react-native-paper';
import { useApprove } from '~/hooks/useApprove';
import { useReject } from '~/hooks/useReject';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageProposalActions_MessageProposal on MessageProposal {
    ...UseApprove_Proposal
    ...UseReject_Proposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageProposalActions_User on User {
    ...UseApprove_User
    ...UseReject_User
  }
`);

export interface MessageProposalActionsProps {
  proposal: FragmentType<typeof MessageProposal>;
  user: FragmentType<typeof User>;
}

export function MessageProposalActions(props: MessageProposalActionsProps) {
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
