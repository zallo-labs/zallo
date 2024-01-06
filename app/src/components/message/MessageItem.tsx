import { useRouter } from 'expo-router';
import { match, P } from 'ts-pattern';

import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { createStyles, useStyles } from '~/util/theme/styles';
import { ListItem, ListItemProps } from '../list/ListItem';
import { MessageIcon } from './MessageIcon';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageItem_MessageProposal on MessageProposal {
    id
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
  fragment MessageItem_User on User {
    id
    approvers {
      id
    }
  }
`);

export interface MessageItemProps {
  proposal: FragmentType<typeof MessageProposal>;
  user: FragmentType<typeof User>;
}

export function MessageItem(props: MessageItemProps) {
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const p = useFragment(MessageProposal, props.proposal);
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
    <ListItem
      leading={(props) => <MessageIcon proposal={p} {...props} />}
      leadingSize="medium"
      headline={p.label || 'Message'}
      supporting={supporting}
      onPress={() => router.push({ pathname: `/(drawer)/message/[id]/`, params: { id: p.id } })}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  approvalRequired: {
    color: colors.primary,
  },
}));
