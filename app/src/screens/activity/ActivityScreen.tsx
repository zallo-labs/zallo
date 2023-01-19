import { Box } from '~/components/layout/Box';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ActivityIcon } from '~/util/theme/icons';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { ProposalItem } from '~/screens/activity/ProposalItem';
import { ProposalMetadata } from '~/queries/proposal';
import { TransferMetadata } from '~/queries/transfer/useTransfersMetadata.sub';
import { IncomingTransferItem } from './IncomingTransferItem';
import { useProposalsMetadata } from '~/queries/proposal/useProposalsMetadata.api';
import { match } from 'ts-pattern';
import { useNavigation } from '@react-navigation/native';
import { ListHeader } from '~/components/list/ListHeader';

type Item =
  | {
      activity: ProposalMetadata;
      type: 'proposal';
    }
  | {
      activity: TransferMetadata;
      type: 'transfer';
    };

export const ActivityScreen = withSkeleton(() => {
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const { navigate } = useNavigation();
  const [pendingProposals] = useProposalsMetadata({ state: 'Pending' });
  const [executingProposals] = useProposalsMetadata({ state: 'Executing' });
  const [executedProposals] = useProposalsMetadata({ state: 'Executed' });
  // const [incomingTransfers] = useTransfersMetadata('IN');

  const sections = useMemo(
    () =>
      [
        {
          title: 'Pending',
          data: pendingProposals.map((activity): Item => ({ activity, type: 'proposal' })),
        },
        {
          title: 'Executing',
          data: executingProposals.map((activity): Item => ({ activity, type: 'proposal' })),
        },
        {
          title: 'Executed',
          data: [
            ...executedProposals.map((activity): Item => ({ activity, type: 'proposal' })),
            // ...incomingTransfers.map((activity): Item => ({ activity, type: 'transfer' })),
          ].sort((a, b) => b.activity.timestamp.toMillis() - a.activity.timestamp.toMillis()),
        },
      ].filter((section) => section.data.length > 0),
    [pendingProposals, executingProposals, executedProposals],
  );

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <AppbarMenu />
        <Appbar.Content title="Activity" />
      </AppbarHeader>

      <SectionList
        renderSectionHeader={({ section }) => <ListHeader>{section.title}</ListHeader>}
        renderItem={({ item }) =>
          match(item)
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
        sections={sections}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}, ListScreenSkeleton);
