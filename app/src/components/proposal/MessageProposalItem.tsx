import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '../list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { MessageIcon } from './MessageIcon';
import { useCanRespond } from './useCanRespond';
import { makeStyles } from '@theme/makeStyles';
import { P, match } from 'ts-pattern';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageProposalItem_MessageProposal on MessageProposal {
    id
    hash
    label
    signature
    ...MessageIcon_MessageProposal
    ...UseCanRespond_Proposal
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageProposalItem_User on User {
    id
    ...UseCanRespond_User
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
  const { canApprove } = useCanRespond({ proposal: p, user });

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
