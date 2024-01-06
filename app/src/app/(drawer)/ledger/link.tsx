import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ok } from 'neverthrow';
import { ActivityIndicator, Text } from 'react-native-paper';
import { match } from 'ts-pattern';

import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { Button } from '~/components/Button';
import { Actions } from '~/components/layout/Actions';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { LedgerItem } from '~/components/link/ledger/LedgerItem';
import { ListHeader } from '~/components/list/ListHeader';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import useBluetoothPermissions from '~/hooks/ble/useBluetoothPermissions';
import { useObservable } from '~/hooks/useObservable';
import { bleDevices } from '~/lib/ble/manager';
import { LedgerLogo } from '~/util/theme/icons';

const Query = gql(/* GraphQL */ `
  query LinkLedgerScreen {
    user {
      ...LedgerItem_user
    }
  }
`);

function LinkLedgerScreen() {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const devices =
    useObservable(useMemo(() => (hasPermission ? bleDevices() : null), [hasPermission])) ?? ok([]);

  const { user } = useQuery(Query).data;

  return (
    <>
      <AppbarOptions headline="Link Ledger" />

      <ScreenSurface>
        <View style={styles.headerContainer}>
          <LedgerLogo style={styles.logo} />

          <Text variant="titleLarge" style={styles.headerText}>
            Unlock your Ledger, enable bluetooth, and open the Ethereum app
          </Text>
        </View>

        {devices.isOk() ? (
          <FlatList
            data={devices.value}
            ListHeaderComponent={
              <ListHeader trailing={() => <ActivityIndicator size={16} />}>
                Available devices
              </ListHeader>
            }
            renderItem={({ item }) => <LedgerItem user={user} device={item} />}
            extraData={[user]}
            contentContainerStyle={styles.listContainer}
            keyExtractor={(d) => d.id}
          />
        ) : (
          match(devices.error)
            .with('permissions-required', () => (
              <>
                <Text variant="titleMedium" style={styles.errorText}>
                  Please grant bluetooth related permissions in order to scan and connect
                </Text>

                <Actions>
                  <Button mode="contained" onPress={requestPermissions}>
                    Grant
                  </Button>
                </Actions>
              </>
            ))
            .with('disabled', () => (
              <Text variant="titleMedium" style={styles.errorText}>
                Please enable bluetooth
              </Text>
            ))
            .with('unsupported', () => (
              <Text variant="titleMedium" style={styles.errorText}>
                Bluetooth is unsupported
              </Text>
            ))
            .exhaustive()
        )}
      </ScreenSurface>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 16,
    marginVertical: 32,
    gap: 32,
    alignItems: 'center',
  },
  logo: {
    height: 64,
    width: 192,
  },
  headerText: {
    textAlign: 'center',
  },
  listContainer: {
    marginVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    margin: 16,
  },
});

export default withSuspense(LinkLedgerScreen, <ScreenSkeleton />);
