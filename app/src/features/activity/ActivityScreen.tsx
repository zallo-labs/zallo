import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { TabNavigatorScreenProps } from '@features/navigation/TabNavigator';
import { useTxs } from '~/queries/tx/useTxs';
import { groupBy, Id } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Appbar, Subheading } from 'react-native-paper';
import { Activity, ActivityItem } from './ActivityItem';
import { ActivitySheet } from '@features/tx/ActivitySheet';
import { useState } from 'react';
import { useExternalTransfers } from '~/queries/tx/useExternalTransfers';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { GenericListScreenSkeleton } from '@components/GenericScreenSkeleton';
import { NoActivites } from './NoActivities';
import { BasicTextField } from '@components/fields/BasicTextField';

interface Section {
  date: number;
  data: Activity[];
}

export type ActivityScreenProps = TabNavigatorScreenProps<'Activity'>;

export const ActivityScreen = withSkeleton((_props: ActivityScreenProps) => {
  const { transfers } = useExternalTransfers();
  const { txs } = useTxs();

  const activities: Activity[] = useMemo(
    () => [...transfers, ...txs],
    [transfers, txs],
  );

  const sections: Section[] = useMemo(
    () =>
      [
        ...groupBy(activities, (a) =>
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
        .sort((a, b) => b.date - a.date),
    [activities],
  );

  const [selected, setSelected] = useState<Id | undefined>(undefined);
  const selectedActivity: Activity | undefined = useMemo(
    () => activities.find((a) => a.id === selected),
    [activities, selected],
  );

  return (
    <Box flex={1}>
      <SectionList
        ListHeaderComponent={
          <Appbar.Header>
            <Box vertical flex={1} mx={2}>
              <BasicTextField
                value={''}
                onChangeText={(value) => {
                  // TODO: implement
                }}
                placeholder="Search by name or address"
                style={{ fontSize: 16 }}
              />
            </Box>

            <Appbar.Action
              icon="calendar-range"
              onPress={() => alert('Search')}
            />
          </Appbar.Header>
        }
        sections={sections}
        keyExtractor={(t) => t.id}
        renderSectionHeader={({ section: { date: timestamp } }) => (
          <Box mx={3} mt={2} mb={1}>
            <Subheading>
              <Timestamp weekday>{timestamp}</Timestamp>
            </Subheading>
          </Box>
        )}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            px={3}
            py={2}
            onPress={() => setSelected(item.id)}
          />
        )}
        ListEmptyComponent={NoActivites}
      />

      {selectedActivity && (
        <ActivitySheet
          activity={selectedActivity}
          onClose={() => setSelected(undefined)}
        />
      )}
    </Box>
  );
}, GenericListScreenSkeleton);
