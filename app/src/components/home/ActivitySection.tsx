import { ItemList } from '#/layout/ItemList';
import { ListItem } from '#/list/ListItem';
import { MessageItem } from '#/message/MessageItem';
import { TransactionItem } from '#/transaction/TransactionItem';
import { FragmentType, gql, useFragment } from '@api';
import { ActivityIcon, NavigateNextIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { match } from 'ts-pattern';

const VISIBLE_PROPOSALS = 3;

const Account = gql(/* GraphQL */ `
  fragment ActivitySection_Account on Account {
    id
    address
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
  const account = useFragment(Account, props.account);
  const user = useFragment(User, props.user);
  const proposals = account.proposals;

  return (
    <ItemList>
      <Link
        asChild
        href={{
          pathname: `/(nav)/[account]/(home)/activity`,
          params: { account: account.address },
        }}
      >
        <ListItem
          leading={ActivityIcon}
          headline="Activity"
          supporting={`${proposals.length} pending proposals`}
          trailing={NavigateNextIcon}
          containerStyle={styles.item}
        />
      </Link>

      {proposals.slice(0, VISIBLE_PROPOSALS).map((proposal) =>
        match(proposal)
          .with({ __typename: 'Transaction' }, (t) => (
            <TransactionItem key={t.id} transaction={t} user={user} containerStyle={styles.item} />
          ))
          .with({ __typename: 'Message' }, (m) => (
            <MessageItem key={m.id} message={m} user={user} containerStyle={styles.item} />
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
