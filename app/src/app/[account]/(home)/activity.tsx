import { SearchParams, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { ListItemHeight } from '~/components/list/ListItem';
import { IncomingTransferItem } from '~/components/activity/IncomingTransferItem';
import { ProposalItem } from '~/components/proposal/ProposalItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { asAddress } from 'lib';
import { asDateTime } from '~/components/format/Timestamp';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';
import { MessageProposalItem } from '~/components/proposal/MessageProposalItem';

const Query = gql(/* GraphQL */ `
  query ActivityTab($accounts: [Address!]!) {
    proposals(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...ProposalItem_TransactionProposal
      ...MessageProposalItem_MessageProposal
    }

    user {
      id
      ...ProposalItem_User
      ...MessageProposalItem_User
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
  subscription ActivityTab_ProposalSubscription($accounts: [Address!]!) {
    proposal(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...ProposalItem_TransactionProposal
    }
  }
`);

const TransferSubscription = gql(/* GraphQL */ `
  subscription ActivityTab_TransferSubscription($accounts: [Address!]!) {
    transfer(input: { accounts: $accounts, direction: In, internal: false }) {
      __typename
      id
      timestamp
      ...IncomingTransferItem_TransferFragment
    }
  }
`);

export type ActivityTabRoute = `/[account]/(home)/activity`;
export type ActivityTabParams = SearchParams<ActivityTabRoute>;

function ActivityTab() {
  const account = asAddress(useLocalSearchParams<ActivityTabParams>().account);

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
            <ProposalItem proposal={p} user={user} />
          ))
          .with({ __typename: 'MessageProposal' }, (p) => (
            <MessageProposalItem proposal={p} user={user} />
          ))
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

// export default ActivityTab;

export default withSuspense(ActivityTab, (props) => (
  <TabScreenSkeleton {...props} listItems={{ leading: true, supporting: true, trailing: true }} />
));

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
});
