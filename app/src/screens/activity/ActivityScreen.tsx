import { Box } from '~/components/layout/Box';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { ActivityIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { groupBy } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { CallCard } from '~/screens/activity/CallCard';
import { ProposalMetadata } from '~/queries/proposal';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Timestamp } from '~/components/format/Timestamp';
import { useTransfersMetadata } from '~/queries/transfer/useTransfersMetadata.sub';
import { TransferType } from '~/gql/generated.sub';
import { TransferMetadata } from '~/queries/transfer/useTransfersMetadata.sub';
import { InTransferCard } from './InTransferCard';
import { useProposalsMetadata } from '~/queries/proposal/useProposalsMetadata.api';

type Item =
  | {
      activity: ProposalMetadata;
      type: 'proposal';
    }
  | {
      activity: TransferMetadata;
      type: 'transfer';
    };

interface Section {
  date: number;
  data: Item[];
}

const toSections = (items: Item[]): Section[] =>
  [
    ...groupBy(items, (m) =>
      m.activity.timestamp
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toSeconds(),
    ).entries(),
  ]
    .map(
      ([timestamp, transfers]): Section => ({
        date: timestamp,
        data: transfers.sort(
          (a, b) =>
            b.activity.timestamp.toMillis() - a.activity.timestamp.toMillis(),
        ),
      }),
    )
    .sort((a, b) => b.date - a.date);

export const ActivityScreen = withSkeleton(() => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const navigation = useRootNavigation();
  const [proposals] = useProposalsMetadata();
  const [transfers] = useTransfersMetadata(TransferType.In);

  const sections = useMemo(
    () =>
      toSections([
        ...proposals.map((activity): Item => ({ activity, type: 'proposal' })),
        ...transfers.map((activity): Item => ({ activity, type: 'transfer' })),
      ]),
    [proposals, transfers],
  );

  return (
    <Box flex={1}>
      <AppbarHeader mode="center-aligned">
        <AppbarMenu />
        <Appbar.Content title="Activity" />
      </AppbarHeader>

      <SectionList
        renderSectionHeader={({ section }) => (
          <Text variant="titleMedium">
            <Timestamp weekday>{section.date}</Timestamp>
          </Text>
        )}
        SectionSeparatorComponent={() => <Box mt={2} />}
        renderItem={({ item }) => {
          if (item.type === 'proposal')
            return (
              <CallCard
                id={item.activity}
                onPress={() =>
                  navigation.navigate('Transaction', { id: item.activity })
                }
              />
            );

          return <InTransferCard id={item.activity.id} />;
        }}
        ItemSeparatorComponent={() => <Box mt={1} />}
        ListEmptyComponent={
          <EmptyListFallback
            Icon={ActivityIcon}
            title="No activites to show"
            subtitle="Check back later!"
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
