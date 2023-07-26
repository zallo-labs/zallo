import { FlashList } from '@shopify/flash-list';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { ListItemHeight } from '~/components/list/ListItem';
import { IncomingTransferItem } from '~/components/call/IncomingTransferItem';
import { ProposalItem } from '~/components/proposal/ProposalItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { Address } from 'lib';
import { asDateTime } from '~/components/format/Timestamp';
import { gql } from '@api/generated';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';

const Query = gql(/* GraphQL */ `
  query ActivityTab($accounts: [Address!]!) {
    proposals(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...ProposalItem_TransactionProposalFragment
    }

    transfers(input: { accounts: $accounts, direction: In, external: true }) {
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
      ...ProposalItem_TransactionProposalFragment
    }
  }
`);

const TransferSubscription = gql(/* GraphQL */ `
  subscription ActivityTab_TransferSubscription($accounts: [Address!]!) {
    transfer(input: { accounts: $accounts, directions: [In], external: true }) {
      __typename
      id
      timestamp
      ...IncomingTransferItem_TransferFragment
    }
  }
`);

export interface ActivityTabParams {}

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'> & { account: Address };

export const ActivityTab = withSuspense(
  ({ account }: ActivityTabProps) => {
    const { proposals, transfers } = useQuery(Query, { accounts: [account] }).data;
    useSubscription({ query: ProposalSubscription, variables: { accounts: [account] } });
    useSubscription({ query: TransferSubscription, variables: { accounts: [account] } });

    const data = [...proposals, ...transfers].sort(
      (a, b) => asDateTime(b.timestamp).toMillis() - asDateTime(a.timestamp).toMillis(),
    );

    return (
      <FlashList
        data={data}
        renderItem={({ item }) =>
          match(item)
            .with({ __typename: 'TransactionProposal' }, (p) => <ProposalItem proposal={p} />)
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
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.__typename}
      />
    );
  },
  (props) => (
    <TabScreenSkeleton {...props} listItems={{ leading: true, supporting: true, trailing: true }} />
  ),
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
