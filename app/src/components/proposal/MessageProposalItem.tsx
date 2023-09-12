import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '../list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { MessageIcon } from './MessageIcon';
import { makeStyles } from '@theme/makeStyles';
import { P, match } from 'ts-pattern';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageProposalItem_MessageProposal on MessageProposal {
    id
    hash
    label
    signature
    updatable
    potentialApprovers {
      id
    }
    ...MessageIcon_MessageProposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageProposalItem_User on User {
    id
    approvers {
      id
    }
  }
`);

export interface MessageProposalItemProps {
  proposal: FragmentType<typeof MessageProposal>;
  user: FragmentType<typeof User>;
}

export function MessageProposalItem(props: MessageProposalItemProps) {
  const styles = useStyles();
  const p = useFragment(MessageProposal, props.proposal);
  const user = useFragment(User, props.user);
  const { navigate } = useNavigation();

  const canApprove =
    p.updatable && p.potentialApprovers.find((a) => user.approvers.find((ua) => a.id === ua.id));

  const supporting = match(p)
    .returnType<ListItemProps['supporting']>()
    .with({ signature: P.nullish }, () =>
      canApprove
        ? ({ Text }) => <Text style={styles.approvalRequired}>Approval required</Text>
        : 'Awaiting approval',
    )
    .with({ signature: P.string }, () => 'Approved')
    .exhaustive();

  return (
    <ListItem
      leading={(props) => <MessageIcon proposal={p} {...props} />}
      leadingSize="medium"
      headline={p.label || 'Message'}
      supporting={supporting}
      onPress={() => navigate('MessageProposal', { proposal: p.hash })}
    />
  );
}

const useStyles = makeStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
}));
