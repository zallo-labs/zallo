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

type Item = Proposal | TransferMetadata;

const isProposalItem = (i: Item): i is Proposal => 'proposer' in i;

const compare = (a: Item, b: Item) => b.timestamp.toMillis() - a.timestamp.toMillis();

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = memo((_props: ActivityTabProps) => {
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
});

export const ActivityTabBadge = withSuspense(
  () => {
    const n = useProposals({ requiresUserAction: true }).length;

    return (
      <Badge visible={n > 0} size={16} style={styles.badge}>
        {n}
      </Badge>
    );
  },
  () => null,
);

const styles = StyleSheet.create({
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
  badge: {
    transform: [{ translateX: -20 }, { translateY: 12 }],
  },
});
