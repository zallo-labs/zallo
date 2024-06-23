import { ItemList } from '#/layout/ItemList';
import { ListItem } from '#/list/ListItem';
import { MessageItem } from '#/message/MessageItem';
import { TransactionItem } from '#/transaction/TransactionItem';
import { FragmentType, gql, useFragment } from '@api';
import { ActivityIcon, NavigateNextIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { match } from 'ts-pattern';

const VISIBLE_PROPOSALS = 3;

const Account = gql(/* GraphQL */ `
  fragment ActivitySection_Account on Account {
    id
    proposals(input: { pending: true }) {
      __typename
      id
      ...TransactionItem_Transaction
      ...MessageItem_Message
    }
  }
`);

const User = gql(/* GraphQL */ `
  fragment ActivitySection_User on User {
    id
    ...TransactionItem_User
    ...MessageItem_User
  }
`);

export interface ActivitySectionProps {
  account: FragmentType<typeof Account>;
  user: FragmentType<typeof User>;
}

export function ActivitySection(props: ActivitySectionProps) {
  const { styles } = useStyles(stylesheet);
  const { proposals } = useFragment(Account, props.account);
  const user = useFragment(User, props.user);

  return (
    <ItemList>
      <ListItem
        leading={ActivityIcon}
        headline="Activity"
        supporting={`${proposals.length} pending proposals`}
        trailing={NavigateNextIcon}
        containerStyle={styles.item}
      />

      {proposals.slice(0, VISIBLE_PROPOSALS).map((proposal) =>
        match(proposal)
          .with({ __typename: 'Transaction' }, (t) => (
            <TransactionItem transaction={t} user={user} containerStyle={styles.item} />
          ))
          .with({ __typename: 'Message' }, (m) => (
            <MessageItem message={m} user={user} containerStyle={styles.item} />
          ))
          .exhaustive(),
      )}
    </ItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));
