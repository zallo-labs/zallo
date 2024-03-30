import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '../list/ListItem';
import { MessageIcon } from './MessageIcon';
import { P, match } from 'ts-pattern';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';

const Message = gql(/* GraphQL */ `
  fragment MessageItem_Message on Message {
    id
    label
    signature
    updatable
    potentialApprovers {
      id
    }
    ...MessageIcon_Message
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageItem_User on User {
    id
    approvers {
      id
    }
  }
`);

export interface MessageItemProps {
  message: FragmentType<typeof Message>;
  user: FragmentType<typeof User>;
}

export function MessageItem(props: MessageItemProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, props.message);
  const user = useFragment(User, props.user);

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
    <Link href={{ pathname: `/(drawer)/message/[id]`, params: { id: p.id } }} asChild>
      <ListItem
        leading={<MessageIcon proposal={p} />}
        headline={p.label || 'Message'}
        supporting={supporting}
      />
    </Link>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
}));
