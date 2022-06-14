import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { TabNavigatorScreenProps } from '@features/navigation/TabNavigator';
import { useTxs } from '~/queries/tx/useTxs';
import { address, createOp, groupBy, Id, Op } from 'lib';
import { useMemo } from 'react';
import { SectionList } from 'react-native';
import { Button, Subheading } from 'react-native-paper';
import { Activity, ActivityItem } from './ActivityItem';
import { ActivitySheet } from '@features/tx/ActivitySheet';
import { useState } from 'react';
import { Actions } from '@components/Actions';
import { ethers } from 'ethers';
import { getTokenContract } from '~/token/token';
import { DAI, LINK, USDC, WBTC } from '~/token/tokens';
import { useWallet } from '@features/wallet/useWallet';
import { useExecute } from '~/mutations/tx/useExecute';
import { useExternalTransfers } from '~/queries/tx/useExternalTransfers';

interface Section {
  date: number;
  data: Activity[];
}

export type ActivityScreenProps = TabNavigatorScreenProps<'Activity'>;

export const ActivityScreen = (_props: ActivityScreenProps) => {
  const { transfers } = useExternalTransfers();
  const { txs } = useTxs();
  const wallet = useWallet();

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

  const transfer: Op = createOp({
    to: address(USDC.addr),
    data: getTokenContract(USDC).interface.encodeFunctionData('transfer', [
      address(wallet.address),
      ethers.utils.parseUnits('0.0501', USDC.decimals),
    ]),
  });
  const execute = useExecute(transfer);

  return (
    <Box flex={1}>
      <SectionList
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
      />

      {selectedActivity && (
        <ActivitySheet
          activity={selectedActivity}
          onClose={() => setSelected(undefined)}
        />
      )}

      {/* <Actions>
        {execute && <Button onPress={execute}>{execute.step}</Button>}
      </Actions> */}
    </Box>
  );
};
