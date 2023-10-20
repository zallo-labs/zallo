import { LedgerLogo } from '@theme/icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { ListHeader } from '~/components/list/ListHeader';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { match } from 'ts-pattern';
import { useQuery } from '~/gql';
import { LedgerItem } from '~/components/link/ledger/LedgerItem';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { useObservable } from '~/hooks/useObservable';
import { bleDevices } from '~/lib/ble/manager';
import { ok } from 'neverthrow';
import useBluetoothPermissions from '~/hooks/ble/useBluetoothPermissions';
import { useMemo } from 'react';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';

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
    <View style={styles.root}>
      <AppbarOptions headline="Link Ledger" />

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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
