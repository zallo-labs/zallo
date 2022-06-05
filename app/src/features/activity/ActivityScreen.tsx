import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { TabNavigatorScreenProps } from '@features/navigation/TabNavigator';
import { useTxs } from '@gql/queries/useTxs';
import { useIndependentTransfers } from '@gql/queries/useIndependentTransfers';
import { groupBy } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Subheading } from 'react-native-paper';
import { Activity, ActivityItem } from './ActivityItem';

interface Section {
  date: number;
  data: Activity[];
}

export type ActivityScreenProps = TabNavigatorScreenProps<'Activity'>;

export const ActivityScreen = (_props: ActivityScreenProps) => {
  const { transfers } = useIndependentTransfers();
  const { txs } = useTxs();

  const sections: Section[] = useMemo(
    () =>
      [
        ...groupBy([...transfers, ...txs], (t) =>
          t.timestamp
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
        .sort((a, b) => b.date - a.date),
    [transfers, txs],
  );

  return (
    <Box flex={1}>
      <SectionList
        sections={sections}
        keyExtractor={(t) => t.id}
        renderSectionHeader={({ section: { date: timestamp } }) => (
          <Box mx={3} mt={2} mb={1}>
            <Subheading>
              <Timestamp>{timestamp}</Timestamp>
            </Subheading>
          </Box>
        )}
        renderItem={({ item }) => (
          <ActivityItem activity={item} px={3} py={2} />
        )}
      />
    </Box>
  );
};
