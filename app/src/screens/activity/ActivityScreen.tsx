import { Box } from '~/components/layout/Box';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ActivityIcon } from '~/util/theme/icons';
import { useMemo } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { ProposalItem } from '~/screens/activity/ProposalItem';
import { Proposal, useProposals } from '@api/proposal';
import { TransferMetadata, useTransfersMetadata } from '@subgraph/transfer';
import { IncomingTransferItem } from './IncomingTransferItem';
import { match, P } from 'ts-pattern';
import { ListHeader } from '~/components/list/ListHeader';
import { makeStyles } from '@theme/makeStyles';
import { FlashList } from '@shopify/flash-list';
import { ListItemHeight } from '~/components/list/ListItem';
import { useNavigation } from '@react-navigation/native';

type Item =
  | {
      activity: Proposal;
      type: 'proposal';
    }
  | {
      activity: TransferMetadata;
      type: 'transfer';
    };

const proposalAsActivity = (proposal: Proposal): Item => ({
  activity: proposal,
  type: 'proposal',
});

export const ActivityScreen = withSkeleton(() => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { navigate } = useNavigation();
  const pRequiringAction = useProposals({ requiresUserAction: true });
  const pAwaitingApproval = useProposals({ states: 'Pending', requiresUserAction: false });
  const pExecuting = useProposals({ states: 'Executing' });
  const pExecuted = useProposals({ states: 'Executed' });
  const incomingTransfers = useTransfersMetadata('IN');

  const data = useMemo(() => {
    const executed = [
      ...pExecuted.map(proposalAsActivity),
      ...incomingTransfers.map((activity): Item => ({ activity, type: 'transfer' })),
    ].sort((a, b) => b.activity.timestamp.toMillis() - a.activity.timestamp.toMillis());

    return [
      ['Action required', pRequiringAction.map(proposalAsActivity)] as const,
      ['Awaiting approval', pAwaitingApproval.map(proposalAsActivity)] as const,
      ['Executing', pExecuting.map(proposalAsActivity)] as const,
      ['Executed', executed] as const,
    ]
      .filter(([_, data]) => data.length)
      .flatMap(([title, data]) => [title, ...data]);
  }, [pRequiringAction, pAwaitingApproval, pExecuting, pExecuted, incomingTransfers]);

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <AppbarMenu />
        <Appbar.Content title="Activity" />
      </AppbarHeader>

      <FlashList
        data={data}
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (title) => <ListHeader>{title}</ListHeader>)
            .with({ type: 'proposal' }, ({ activity: { id } }) => (
              <ProposalItem proposal={id} onPress={() => navigate('Proposal', { proposal: id })} />
            ))
            .with({ type: 'transfer' }, ({ activity: transfer }) => (
              <IncomingTransferItem transfer={transfer.id} />
            ))
            .exhaustive()
        }
        ListEmptyComponent={
          <EmptyListFallback
            Icon={ActivityIcon}
            title="No activity to show"
            subtitle="Check back later!"
            isScreenRoot
          />
        }
        contentContainerStyle={styles.listContainer}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}, ListScreenSkeleton);

const useStyles = makeStyles(({ s }) => ({
  listContainer: {
    paddingBottom: s(8),
  },
}));
