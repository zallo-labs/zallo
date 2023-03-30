import { Proposal, useProposals } from '@api/proposal';
import { FlashList } from '@shopify/flash-list';
import { TransferMetadata, useTransfers } from '@subgraph/transfer';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Badge, Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { ListItemHeight } from '~/components/list/ListItem';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';
import { IncomingTransferItem } from '~/components/call/IncomingTransferItem';
import { ProposalItem } from '~/components/proposal/ProposalItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabBadge } from '~/components/tab/TabBadge';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';

type Item = Proposal | TransferMetadata;

const isProposalItem = (i: Item): i is Proposal => 'proposer' in i;

const compare = (a: Item, b: Item) => b.timestamp.toMillis() - a.timestamp.toMillis();

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = withSuspense((_props: ActivityTabProps) => {
  const { navigate } = useRootNavigation2();

  const proposals = useProposals();
  const inTransfers = useTransfers('IN');
  const data: Item[] = [...proposals, ...inTransfers].sort(compare);

  return (
    <FlashList
      data={data}
      renderItem={({ item }) =>
        match(item)
          .when(isProposalItem, ({ id }) => (
            <ProposalItem proposal={id} onPress={() => navigate('Proposal', { proposal: id })} />
          ))
          .otherwise((transfer) => <IncomingTransferItem transfer={transfer.id} />)
      }
      ListEmptyComponent={
        <Text variant="bodyLarge" style={styles.emptyListText}>
          There is no activity to show
        </Text>
      }
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      showsVerticalScrollIndicator={false}
    />
  );
}, TabScreenSkeleton);

export const ActivityTabBadge = withSuspense(
  () => <TabBadge value={useProposals({ requiresUserAction: true }).length} style={styles.badge} />,
  () => null,
);

const styles = StyleSheet.create({
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
  badge: {
    transform: [{ translateX: -10 }],
  },
});
