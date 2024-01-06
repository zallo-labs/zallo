import { StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { useSubscription } from 'urql';

import { AccountParams } from '~/app/(drawer)/[account]/(home)/_layout';
import { IncomingTransferItem } from '~/components/activity/IncomingTransferItem';
import { asDateTime } from '~/components/format/Timestamp';
import { ListItemHeight } from '~/components/list/ListItem';
import { MessageItem } from '~/components/message/MessageItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TransactionItem } from '~/components/transaction/TransactionItem';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { useLocalParams } from '~/hooks/useLocalParams';

const Query = gql(/* GraphQL */ `
  query ActivityTab($accounts: [UAddress!]!) {
    proposals(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...TransactionItem_TransactionProposal
      ...MessageItem_MessageProposal
    }

    user {
      id
      ...TransactionItem_User
      ...MessageItem_User
    }

    transfers(input: { accounts: $accounts, direction: In, internal: false }) {
      __typename
      id
      timestamp
      ...IncomingTransferItem_TransferFragment
    }
  }
`);

const ProposalSubscription = gql(/* GraphQL */ `
  subscription ActivityTab_ProposalSubscription($accounts: [UAddress!]!) {
    proposal(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...TransactionItem_TransactionProposal
    }
  }
`);

const TransferSubscription = gql(/* GraphQL */ `
  subscription ActivityTab_TransferSubscription($accounts: [UAddress!]!) {
    transfer(input: { accounts: $accounts, direction: In, internal: false }) {
      __typename
      id
      timestamp
      ...IncomingTransferItem_TransferFragment
    }
  }
`);

const ActivityTabParams = AccountParams;

function ActivityTab() {
  const { account } = useLocalParams(ActivityTabParams);

  // When proposals are invalidated (on proposal sub) and the user is on a different screen this screen remains mounted but suspense doesn't occur
  const {
    proposals = [],
    transfers = [],
    user,
  } = useQuery(Query, { accounts: [account] }).data ?? {};
  useSubscription({ query: ProposalSubscription, variables: { accounts: [account] } });
  useSubscription({ query: TransferSubscription, variables: { accounts: [account] } });

  const items = [...proposals, ...transfers].sort(
    (a, b) => asDateTime(b.timestamp).toMillis() - asDateTime(a.timestamp).toMillis(),
  );

  return (
    <FlashList
      data={items}
      renderItem={({ item }) =>
        match(item)
          .with({ __typename: 'TransactionProposal' }, (p) => (
            <TransactionItem proposal={p} user={user} />
          ))
          .with({ __typename: 'MessageProposal' }, (p) => <MessageItem proposal={p} user={user} />)
          .with({ __typename: 'Transfer' }, (transfer) => (
            <IncomingTransferItem transfer={transfer} />
          ))
          .exhaustive()
      }
      ListEmptyComponent={
        <Text variant="bodyLarge" style={styles.emptyListText}>
          There is no activity to show
        </Text>
      }
      extraData={[user]}
      contentContainerStyle={styles.contentContainer}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      getItemType={(item) => item.__typename}
    />
  );
}

export default withSuspense(
  ActivityTab,
  <TabScreenSkeleton listItems={{ leading: true, supporting: true, trailing: true }} />,
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
});
