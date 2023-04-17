import { Proposal, useProposals } from '@api/proposal';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { ListItemHeight } from '~/components/list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { IncomingTransferItem } from '~/components/call/IncomingTransferItem';
import { ProposalItem } from '~/components/proposal/ProposalItem';
import { TabNavigatorScreenProp } from '.';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabBadge } from '~/components/tab/TabBadge';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { Transfer, useTransfers } from '@api/account';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';

type Item = Proposal | Transfer;

const isProposalItem = (i: Item): i is Proposal => 'proposer' in i;

const compare = (a: Item, b: Item) => b.timestamp.toMillis() - a.timestamp.toMillis();

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = withSuspense((_props: ActivityTabProps) => {
  const { navigate } = useNavigation();

  const proposals = useProposals();
  const inTransfers = useTransfers(useSelectedAccountId(), 'IN');
  const data: Item[] = [...proposals, ...inTransfers].sort(compare);

  return (
    <FlashList
      data={data}
      renderItem={({ item }) =>
        match(item)
          .when(isProposalItem, ({ id }) => (
            <ProposalItem proposal={id} onPress={() => navigate('Proposal', { proposal: id })} />
          ))
          .otherwise((transfer) => <IncomingTransferItem transfer={transfer} />)
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
