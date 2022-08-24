import { Box } from '~/components/layout/Box';
import { EmptyListFallback } from '~/components/EmptyListFallback';
import { ListScreenSkeleton } from '~/components/skeleton/ListScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Suspend } from '~/components/Suspender';
import { ActivityIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { groupBy } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { useAppbarHeader } from '~/components/Appbar/useAppbarHeader';
import { CallCard } from '~/components/call/CallCard';
import { TxMetadata } from '~/queries/tx';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Timestamp } from '~/components/format/Timestamp';
import { useTxsMetadata } from '~/queries/tx/metadata/useTxsMetadata';

interface Section {
  date: number;
  data: TxMetadata[];
}

const toSections = (txs: TxMetadata[]): Section[] =>
  [
    ...groupBy(txs, (a) =>
      a.timestamp
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .toSeconds(),
    ).entries(),
  ]
    .map(
      ([timestamp, transfers]): Section => ({
        date: timestamp,
        data: transfers.sort(
          (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
        ),
      }),
    )
    .sort((a, b) => b.date - a.date);

export const ActivityScreen = withSkeleton(() => {
  const styles = useStyles();
  const { AppbarHeader, handleScroll } = useAppbarHeader();
  const navigation = useRootNavigation();
  const { txs, loading } = useTxsMetadata();

  const sections = useMemo(() => toSections(txs), [txs]);

  if (txs.length === 0 && loading) return <Suspend />;

  return (
    <Box>
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
        SectionSeparatorComponent={() => <Box my={2} />}
        renderItem={({ item }) => (
          <CallCard
            id={item}
            onPress={() => {
              navigation.navigate('Transaction', { id: item });
            }}
          />
        )}
        ItemSeparatorComponent={() => <Box my={2} />}
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
    marginHorizontal: space(3),
  },
}));
