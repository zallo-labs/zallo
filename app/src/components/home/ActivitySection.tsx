import { ItemList } from '#/layout/ItemList';
import { ListItem } from '#/list/ListItem';
import { MessageItem } from '#/message/MessageItem';
import { TransactionItem } from '#/transaction/TransactionItem';
import { ActivityIcon, NavigateNextIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { match } from 'ts-pattern';
import { ActivitySection_account$key } from '~/api/__generated__/ActivitySection_account.graphql';
import { ActivitySection_user$key } from '~/api/__generated__/ActivitySection_user.graphql';

const VISIBLE_PROPOSALS = 3;

const Account = graphql`
  fragment ActivitySection_account on Account {
    id
    address
    proposals(input: { pending: true }) {
      __typename
      id
      ...TransactionItem_transaction @alias
      ...MessageItem_message @alias
    }
  }
`;

const User = graphql`
  fragment ActivitySection_user on User {
    id
    ...TransactionItem_user
    ...MessageItem_user
  }
`;

export interface ActivitySectionProps {
  account: ActivitySection_account$key;
  user: ActivitySection_user$key;
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
          .with({ __typename: 'Transaction' }, (t) =>
            t.TransactionItem_transaction ? (
              <TransactionItem
                key={t.id}
                transaction={t.TransactionItem_transaction}
                user={user}
                containerStyle={styles.item}
              />
            ) : null,
          )
          .with({ __typename: 'Message' }, (m) =>
            m.MessageItem_message ? (
              <MessageItem
                key={m.id}
                message={m.MessageItem_message}
                user={user}
                containerStyle={styles.item}
              />
            ) : null,
          )
          .otherwise(() => {
            throw new Error('Unexpected item type');
          }),
      )}
    </ItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));
