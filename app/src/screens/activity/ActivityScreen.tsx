import { Box } from '~/components/layout/Box';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ActivityIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { ProposalItem } from '~/screens/activity/ProposalItem';
import { ProposalMetadata } from '~/queries/proposal';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useTransfersMetadata } from '~/queries/transfer/useTransfersMetadata.sub';
import { TransferType } from '~/gql/generated.sub';
import { TransferMetadata } from '~/queries/transfer/useTransfersMetadata.sub';
import { IncomingTransferItem } from './IncomingTransferItem';
import { useProposalsMetadata } from '~/queries/proposal/useProposalsMetadata.api';
import { ProposalStatus } from '~/gql/generated.api';
import { match } from 'ts-pattern';

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
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const navigation = useRootNavigation();
  const [proposals] = useProposalsMetadata({ status: ProposalStatus.Proposed });
  const [executions] = useProposalsMetadata({
    status: ProposalStatus.Executed,
  });
  const [incomingTransfers] = useTransfersMetadata(TransferType.In);

  const sections = useMemo(
    () =>
      [
        {
          title: 'Awaiting approval',
          data: proposals.map(
            (activity): Item => ({ activity, type: 'proposal' }),
          ),
        },
        {
          title: 'Executed',
          data: [
            ...executions.map(
              (activity): Item => ({ activity, type: 'proposal' }),
            ),
            ...incomingTransfers.map(
              (activity): Item => ({ activity, type: 'transfer' }),
            ),
          ].sort(
            (a, b) =>
              b.activity.timestamp.toMillis() - a.activity.timestamp.toMillis(),
          ),
        },
      ].filter((section) => section.data.length > 0),
    [executions, proposals, incomingTransfers],
  );

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <AppbarMenu />
        <Appbar.Content title="Activity" />
      </AppbarHeader>

      <SectionList
        renderSectionHeader={({ section }) => (
          <Text variant="titleMedium">{section.title}</Text>
        )}
        SectionSeparatorComponent={() => <Box mt={2} />}
        renderItem={({ item }) =>
          match(item)
            .with({ type: 'proposal' }, ({ activity }) => (
              <ProposalItem
                id={activity}
                onPress={() =>
                  navigation.navigate('Transaction', { id: activity })
                }
              />
            ))
            .with({ type: 'transfer' }, ({ activity }) => (
              <IncomingTransferItem id={activity.id} />
            ))
            .exhaustive()
        }
        ItemSeparatorComponent={() => <Box mt={1} />}
        ListEmptyComponent={
          <EmptyListFallback
            Icon={ActivityIcon}
            title="No activity to show"
            subtitle="Check back later!"
            isScreenRoot
          />
        }
        sections={sections}
        style={styles.list}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}, ListScreenSkeleton);

const useStyles = makeStyles(({ space }) => ({
  list: {
    marginHorizontal: space(2),
  },
}));
