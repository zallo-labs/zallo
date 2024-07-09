import { ListItem, ListItemProps } from '../list/ListItem';
import { MessageIcon } from './MessageIcon';
import { P, match } from 'ts-pattern';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { withSuspense } from '#/skeleton/withSuspense';
import { memo } from 'react';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { graphql } from 'relay-runtime';
import { MessageItem_message$key } from '~/api/__generated__/MessageItem_message.graphql';
import { MessageItem_user$key } from '~/api/__generated__/MessageItem_user.graphql';
import { useFragment } from 'react-relay';

const Message = graphql`
  fragment MessageItem_message on Message {
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
    ...MessageIcon_message
  }
`;

const User = graphql`
  fragment MessageItem_user on User {
    id
    approvers {
      id
    }
  }
`;

export interface MessageItemProps extends Partial<ListItemProps> {
  message: MessageItem_message$key;
  user: MessageItem_user$key;
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
    <Link href={{ pathname: `/(nav)/message/[id]`, params: { id: p.id } }} asChild>
      <ListItem
        leading={<MessageIcon proposal={p} />}
        headline={p.label || 'Message'}
        supporting={supporting}
        {...props}
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
