import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem, ListItemProps } from '../list/ListItem';
import { MessageIcon } from './MessageIcon';
import { P, match } from 'ts-pattern';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { withSuspense } from '#/skeleton/withSuspense';
import { memo } from 'react';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';

const Message = gql(/* GraphQL */ `
  fragment MessageItem_Message on Message {
    id
    label
    signature
    updatable
    approvals {
      id
      approver {
        id
      }
    }
    policy {
      id
      approvers {
        id
      }
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

function MessageItem_(props: MessageItemProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, props.message);
  const user = useFragment(User, props.user);

  const canApprove =
    p.updatable &&
    user.approvers.some(
      (ua) =>
        p.policy.approvers.some((a) => a.id === ua.id) &&
        !p.approvals.some((a) => a.approver.id === ua.id),
    );

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

export const MessageItem = withSuspense(
  memo(MessageItem_),
  <ListItemSkeleton leading supporting />,
);
