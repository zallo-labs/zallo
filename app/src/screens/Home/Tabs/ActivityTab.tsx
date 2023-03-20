import { Proposal, useProposals } from '@api/proposal';
import { FlashList } from '@shopify/flash-list';
import { TransferMetadata, useTransfersMetadata } from '@subgraph/transfer';
import { ActivityIcon } from '@theme/icons';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';
import { match } from 'ts-pattern';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListItemHeight } from '~/components/list/ListItem';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';
import { IncomingTransferItem } from '~/screens/activity/IncomingTransferItem';
import { ProposalItem } from '~/components/proposal/ProposalItem';
import { TabNavigatorScreenProp } from '.';

type Item = Proposal | TransferMetadata;

const isProposalItem = (i: Item): i is Proposal => 'proposer' in i;

const compare = (a: Item, b: Item) => b.timestamp.toMillis() - a.timestamp.toMillis();

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = memo((_props: ActivityTabProps) => {
  const { navigate } = useRootNavigation2();

  const proposals = useProposals();
  const inTransfers = useTransfersMetadata('IN');
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
        <EmptyListFallback
          Icon={ActivityIcon}
          title="No activity to show"
          subtitle="Check back later!"
        />
      }
      contentContainerStyle={styles.container}
      estimatedItemSize={ListItemHeight.DOUBLE_LINE}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
});

export const ActivityTabBadge = () => {
  const n = useProposals({ requiresUserAction: true }).length;
  return <Badge visible={n > 0} />;
};
