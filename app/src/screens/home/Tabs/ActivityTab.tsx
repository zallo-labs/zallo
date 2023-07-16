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
import { gql } from '@api/gen';
import { useSuspenseQuery } from '@apollo/client';
import { ActivityQuery, ActivityQueryVariables } from '@api/gen/graphql';
import {
  useActivityTab_ProposalSubscription,
  useActivityTab_TransferSubscription,
} from '@api/generated';
import { updateQuery } from '~/gql/util';

const QueryDoc = gql(/* GraphQL */ `
  query Activity($accounts: [Address!]!) {
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

gql(/* GraphQL */ `
  subscription ActivityTab_Proposal($accounts: [Address!]!) {
    proposal(input: { accounts: $accounts }) {
      __typename
      id
      timestamp: createdAt
      ...ProposalItem_TransactionProposalFragment
    }
  }

  subscription ActivityTab_Transfer($accounts: [Address!]!) {
    transfer(input: { accounts: $accounts, directions: [In], external: true }) {
      __typename
      id
      timestamp
      ...IncomingTransferItem_TransferFragment
    }
  }
`);

export interface ActivityTabParams {
  account: Address;
}

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = withSuspense(
  ({ route }: ActivityTabProps) => {
    const { account } = route.params;

    const { proposals, transfers } = useSuspenseQuery<ActivityQuery, ActivityQueryVariables>(
      QueryDoc,
      { variables: { accounts: [account] } },
    ).data;

    useActivityTab_ProposalSubscription({
      variables: { accounts: [account] },
      onData: ({ client: { cache }, data: { data } }) => {
        const proposal = data?.proposal;
        if (!proposal) return;

        updateQuery<ActivityQuery, ActivityQueryVariables>({
          query: QueryDoc,
          cache,
          variables: { accounts: [account] },
          updater: (data) => {
            if (!data.proposals.find((t) => t.id === proposal.id)) data.proposals.push(proposal);
          },
        });
      },
    });

    useActivityTab_TransferSubscription({
      variables: { accounts: [account] },
      onData: ({ client: { cache }, data: { data } }) => {
        const transfer = data?.transfer;
        if (!transfer) return;

        updateQuery<ActivityQuery, ActivityQueryVariables>({
          query: QueryDoc,
          cache,
          variables: { accounts: [account] },
          updater: (data) => {
            if (!data.transfers.find((t) => t.id === transfer.id)) data.transfers.push(transfer);
          },
        });
      },
    });

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
