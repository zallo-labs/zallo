import { Searchbar } from '#/Appbar/Searchbar';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { AccountParams } from '../../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { asDateTime } from '#/format/Timestamp';
import { FlashList } from '@shopify/flash-list';
import { P, match } from 'ts-pattern';
import { TransactionItem } from '#/transaction/TransactionItem';
import { IncomingTransferItem } from '#/activity/IncomingTransferItem';
import { MessageItem } from '#/message/MessageItem';
import { createStyles, useStyles } from '@theme/styles';
import { ListItemHeight } from '#/list/ListItem';
import { CORNER } from '@theme/paper';
import { View } from 'react-native';
import { AppbarBack } from '#/Appbar/AppbarBack';
import { SearchIcon } from '@theme/icons';
import { ITEM_LIST_GAP } from '#/layout/ItemList';
import { NoActivity } from '#/activity/NoActivity';
import { ListHeader } from '#/list/ListHeader';
import { DateTime } from 'luxon';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import {
  activity_ActivityPaneQuery,
  activity_ActivityPaneQuery$data,
} from '~/api/__generated__/activity_ActivityPaneQuery.graphql';
import { Pane } from '#/layout/Pane';

const Query = graphql`
  query activity_ActivityPaneQuery($account: UAddress!) {
    account(address: $account) {
      id
      proposals {
        __typename
        id
        timestamp: createdAt
        ... on Transaction {
          status
        }
        ... on Message {
          signature
        }
        ...TransactionItem_transaction @alias
        ...MessageItem_message @alias
      }
      transfers(input: { incoming: true, internal: false }) {
        __typename
        id
        timestamp
        ...IncomingTransferItem_transfer
      }
    }

    user {
      id
      ...TransactionItem_user
      ...MessageItem_user
    }
  }
`;

function ActivityPane() {
  const { styles } = useStyles(stylesheet);
  const { account } = useLocalParams(AccountParams);

  const { account: a, user } = useLazyQuery<activity_ActivityPaneQuery>(Query, { account });

  const items = [...(a?.proposals ?? []), ...(a?.transfers ?? [])]
    .map((v) => ({ ...v, section: getItemSection(v), timestamp: asDateTime(v.timestamp) }))
    .sort((a, b) => asDateTime(b.timestamp).toMillis() - asDateTime(a.timestamp).toMillis());

  const data = [...new Set(items.map((i) => i.section))]
    .sort((a, b) => sectionOrder(a) - sectionOrder(b))
    .flatMap((section) => {
      const sectionItems = items.filter((i) => i.section === section);
      return sectionItems.length ? [sectionLabel(section), ...withFirstAndLast(sectionItems)] : [];
    });

  return (
    <Pane flex>
      <FlashList
        ListHeaderComponent={
          <>
            <Searchbar leading={AppbarBack} placeholder="Search activity" trailing={SearchIcon} />
          </>
        }
        data={data}
        renderItem={({ item }) => {
          if (typeof item === 'string') return <ListHeader>{item}</ListHeader>;

          const containerStyle = [
            styles.item,
            item.first && styles.firstItem,
            item.last && styles.lastItem,
          ];

          return match(item)
            .with({ __typename: 'Transaction' }, (t) =>
              t.TransactionItem_transaction ? (
                <TransactionItem
                  transaction={t.TransactionItem_transaction}
                  user={user}
                  containerStyle={containerStyle}
                />
              ) : null,
            )
            .with({ __typename: 'Message' }, (m) =>
              m.MessageItem_message ? (
                <MessageItem
                  message={m.MessageItem_message}
                  user={user}
                  containerStyle={containerStyle}
                />
              ) : null,
            )
            .with({ __typename: 'Transfer' }, (t) => (
              <IncomingTransferItem transfer={t as any} containerStyle={containerStyle} />
            ))
            .otherwise(() => {
              throw new Error('Unexpected item type');
            });
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<NoActivity />}
        contentContainerStyle={styles.contentContainer}
        extraData={[user]}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
        getItemType={(item) => (typeof item === 'string' ? 'section' : item.__typename)}
      />
    </Pane>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  contentContainer: {
    paddingBottom: 8,
  },
  item: {
    backgroundColor: colors.surface,
  },
  separator: {
    height: ITEM_LIST_GAP,
  },
  firstItem: {
    borderTopLeftRadius: CORNER.l,
    borderTopRightRadius: CORNER.l,
  },
  lastItem: {
    borderBottomLeftRadius: CORNER.l,
    borderBottomRightRadius: CORNER.l,
  },
}));

type Item =
  | NonNullable<activity_ActivityPaneQuery$data['account']>['proposals'][0]
  | NonNullable<activity_ActivityPaneQuery$data['account']>['transfers'][0];
type Section = ReturnType<typeof getItemSection>;

function getItemSection(item: Item) {
  return match(item)
    .with({ __typename: 'Transaction', status: 'Pending' }, () => 'Pending approval' as const)
    .with({ __typename: 'Transaction', status: 'Scheduled' }, () => 'Scheduled' as const)
    .with({ __typename: 'Message', signature: P.nullish }, (m) => 'Pending approval' as const)
    .otherwise((v) => {
      const t = asDateTime(v.timestamp).startOf('day');

      const daysAgo = DateTime.now().startOf('day').diff(t).as('days');
      if (daysAgo == 0) return 'Today' as const;
      if (daysAgo == 1) return 'Yesterday' as const;
      if (daysAgo <= 7) return 'Past 7 days' as const;

      return DateTime.fromObject({ month: t.month, year: t.year }).toMillis();
    });
}

const SECTION_ORDERING = [
  'Pending approval',
  'Scheduled',
  'Today',
  'Yesterday',
  'Past 7 days',
] satisfies Section[];

function sectionOrder(section: Section) {
  return typeof section === 'string' ? SECTION_ORDERING.indexOf(section) : section;
}

function sectionLabel(section: Section) {
  if (typeof section === 'string') return section;

  const dt = DateTime.fromMillis(section);

  const now = DateTime.now();
  if (dt.year === now.year && dt.month === now.month) return 'This month';

  return dt.toLocaleString({
    year: dt.year !== now.year ? '2-digit' : undefined,
    month: 'long',
  });
}

function withFirstAndLast<T>(items: T[]) {
  return items.map((item, index, items) => ({
    ...item,
    first: index === 0,
    last: index === items.length - 1,
  }));
}

export default withSuspense(ActivityPane, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
