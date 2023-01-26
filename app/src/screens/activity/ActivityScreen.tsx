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
import { ProposalMetadata } from '~/queries/proposal';
import {
  TransferMetadata,
  useTransfersMetadata,
} from '~/queries/transfer/useTransfersMetadata.sub';
import { IncomingTransferItem } from './IncomingTransferItem';
import { useProposalsMetadata } from '~/queries/proposal/useProposalsMetadata.api';
import { match, P } from 'ts-pattern';
import { ListHeader } from '~/components/list/ListHeader';
import { makeStyles } from '@theme/makeStyles';
import { FlashList } from '@shopify/flash-list';
import { BottomNavigatorScreenProps } from '~/navigation/BottomNavigator';
import { ListItemHeight } from '~/components/list/ListItem';

type Item =
  | {
      activity: ProposalMetadata;
      type: 'proposal';
    }
  | {
      activity: TransferMetadata;
      type: 'transfer';
    };

const proposalToActivity = (proposal: ProposalMetadata): Item => ({
  activity: proposal,
  type: 'proposal',
});

export type ActivityScreenProps = BottomNavigatorScreenProps<'Activity'>;

export const ActivityScreen = withSkeleton(({ navigation: { navigate } }: ActivityScreenProps) => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const pRequiringAction = useProposalsMetadata({ actionRequired: true });
  const pAwaitingApproval = useProposalsMetadata({ states: 'Pending', actionRequired: false });
  const pExecuting = useProposalsMetadata({ states: 'Executing' });
  const pExecuted = useProposalsMetadata({ states: 'Executed' });
  const incomingTransfers = useTransfersMetadata('IN');

  const data = useMemo(() => {
    const executed = [
      ...pExecuted.map(proposalToActivity),
      ...incomingTransfers.map((activity): Item => ({ activity, type: 'transfer' })),
    ].sort((a, b) => b.activity.timestamp.toMillis() - a.activity.timestamp.toMillis());

    return [
      ['Action required', pRequiringAction.map(proposalToActivity)] as const,
      ['Awaiting approval', pAwaitingApproval.map(proposalToActivity)] as const,
      ['Executing', pExecuting.map(proposalToActivity)] as const,
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
            .with({ type: 'proposal' }, ({ activity: proposal }) => (
              <ProposalItem
                proposal={proposal}
                onPress={() => navigate('Proposal', { proposal })}
              />
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
