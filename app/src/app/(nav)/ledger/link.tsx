import { LedgerLogo } from '@theme/icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { ListHeader } from '#/list/ListHeader';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { match } from 'ts-pattern';
import { LedgerItem } from '#/link/ledger/LedgerItem';
import { Appbar } from '#/Appbar/Appbar';
import { useObservable } from '~/hooks/useObservable';
import { bleDevices } from '~/lib/ble/manager';
import { ok } from 'neverthrow';
import useBluetoothPermissions from '~/hooks/ble/useBluetoothPermissions';
import { useMemo } from 'react';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScreenSurface } from '#/layout/ScreenSurface';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { link_LinkLedgerScreenQuery } from '~/api/__generated__/link_LinkLedgerScreenQuery.graphql';

const Query = graphql`
  query link_LinkLedgerScreenQuery {
    user {
      ...LedgerItem_user
    }
  }
`;

function LinkLedgerScreen() {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();
  const devices =
    useObservable(useMemo(() => (hasPermission ? bleDevices() : null), [hasPermission])) ?? ok([]);

  const { user } = useLazyQuery<link_LinkLedgerScreenQuery>(Query, {});

  return (
    <>
      <Appbar headline="Link Ledger" />

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
            renderItem={({ item }) => <LedgerItem device={item} user={user} />}
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

export { ErrorBoundary } from '#/ErrorBoundary';
