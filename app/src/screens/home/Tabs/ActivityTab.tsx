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
import { Transfer, useTransfers } from '@api/transfer';
import { Address } from 'lib';
import { asDateTime } from '~/components/format/Timestamp';

type Item = Proposal | Transfer;

const isProposalItem = (i: Item): i is Proposal => 'hash' in i;

const compare = (a: Item, b: Item) =>
  asDateTime(b.timestamp).toMillis() - asDateTime(a.timestamp).toMillis();

export interface ActivityTabParams {
  account: Address;
}

export type ActivityTabProps = TabNavigatorScreenProp<'Activity'>;

export const ActivityTab = withSuspense(
  ({ route }: ActivityTabProps) => {
    const { account } = route.params;
    const { navigate } = useNavigation();

    const proposals = useProposals({ accounts: [account] });
    const inTransfers = useTransfers({
      accounts: [account],
      direction: 'In',
      excludeProposalOriginating: true,
    });
    const data: Item[] = [...proposals, ...inTransfers].sort(compare);

    return (
      <FlashList
        data={data}
        renderItem={({ item }) =>
          match(item)
            .when(isProposalItem, ({ hash: id }) => (
              <ProposalItem proposal={id} onPress={() => navigate('Proposal', { proposal: id })} />
            ))
            .otherwise((transfer) => <IncomingTransferItem transfer={transfer} />)
        }
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.emptyListText}>
            There is no activity to show
          </Text>
        }
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        showsVerticalScrollIndicator={false}
      />
    );
  },
  (props) => (
    <TabScreenSkeleton {...props} listItems={{ leading: true, supporting: true, trailing: true }} />
  ),
);

export interface ActivityTabBadgeProps {
  account: Address;
}

export const ActivityTabBadge = withSuspense(
  ({ account }: ActivityTabBadgeProps) => (
    <TabBadge
      value={useProposals({ accounts: [account], responseRequested: true }).length}
      style={styles.badge}
    />
  ),
  () => null,
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 8,
  },
  emptyListText: {
    alignSelf: 'center',
    margin: 16,
  },
  badge: {
    transform: [{ translateX: -10 }],
  },
});
