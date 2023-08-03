import { useCallback, useState } from 'react';
import { BluetoothIcon, LedgerLogo } from '@theme/icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { LedgerBleDevice, useLedgerBleDevices } from './useLedgerBleDevices';
import { ListItem } from '~/components/list/ListItem';
import { ListHeader } from '~/components/list/ListHeader';
import { clog } from '~/util/format';
import { hideSnackbar, showError, showInfo } from '~/provider/SnackbarProvider';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { connectLedger } from '~/util/ledger';
import { gql } from '@api/generated';
import { getAuthHeaders, useUrqlApiClient } from '@api/client';
import { match } from 'ts-pattern';
import { ResultAsync, ok, err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import { OperationContext, useMutation } from 'urql';

const getDeviceId = (device: LedgerBleDevice) => device.descriptor.id;

const Query = gql(/* GraphQL */ `
  query PairLedgerScreen {
    user {
      id
      pairingToken
    }
  }
`);

const Rename = gql(/* GraphQL */ `
  mutation PairLedgerScreen_rename($approver: Address!, $name: String!) {
    updateApprover(input: { address: $approver, name: $name }) {
      id
      name
    }
  }
`);

export type PairLedgerScreenProps = StackNavigatorScreenProps<'PairLedger'>;

export function PairLedgerScreen({ navigation: { navigate } }: PairLedgerScreenProps) {
  const devices = useLedgerBleDevices();
  const apiClient = useUrqlApiClient();
  const rename = useMutation(Rename)[1];

  const [connecting, setConnecting] = useState<DeviceId | null>(null);
  const connect = useCallback(
    async (device: LedgerBleDevice) => {
      setConnecting(getDeviceId(device));
      showInfo('Connecting...', { autoHide: false });

      await connectLedger(device)
        .andThen(
          (ledger) =>
            new ResultAsync(
              (async () => {
                showInfo('Please confirm pairing from your Ledger', { autoHide: false });
                const headers = await getAuthHeaders(ledger);
                hideSnackbar();

                const context: Partial<OperationContext> = {
                  fetchOptions: { headers },
                  skipAddAuthToOperation: true,
                  suspense: false,
                };

                const [query] = await Promise.all([
                  apiClient.query(Query, {}, context),
                  rename(
                    {
                      approver: ledger.address,
                      name: device.descriptor.name || device.deviceModel.productName,
                    },
                    context,
                  ),
                ]);

                clog(query.data?.user);

                return query.data
                  ? ok(query.data.user.pairingToken)
                  : err(
                      new Error('Failed to get pairing token, try again later', {
                        cause: query.error,
                      }),
                    );
              })(),
            ),
        )
        .match(
          (pairingToken) => navigate('PairConfirmSheet', { token: pairingToken }),
          (e) => {
            showError(e.message);
            clog(e.cause);
          },
        );

      setConnecting(null);
    },
    [apiClient, navigate, rename],
  );

  return (
    <Screen>
      <Appbar mode="small" headline="Pair" />

      <View style={styles.headerContainer}>
        <LedgerLogo width={undefined} height={64} />

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
          renderItem={({ item: d }) => (
            <ListItem
              leading={BluetoothIcon}
              headline={d.descriptor.name || d.descriptor.id}
              supporting={d.deviceModel?.productName}
              trailing={d.descriptor.id}
              lines={2}
              onPress={d.deviceModel && (() => connect(d))}
              selected={connecting === getDeviceId(d)}
              disabled={!!connecting}
            />
          )}
          extraData={[connect]}
          contentContainerStyle={styles.listContainer}
          keyExtractor={getDeviceId}
        />
      ) : (
        match(devices.error)
          .with({ type: 'permission-required' }, (error) => (
            <>
              <Text variant="titleMedium" style={styles.errorText}>
                Please grant bluetooth related permissions in order to scan and connect
              </Text>

              <Actions>
                <Button mode="contained" onPress={() => error.requestPermissions?.()}>
                  Grant
                </Button>
              </Actions>
            </>
          ))
          .with({ type: 'bluetooth-disabled' }, () => (
            <Text variant="titleMedium" style={styles.errorText}>
              Enable bluetooth to scan and connect
            </Text>
          ))
          .exhaustive()
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 16,
    marginVertical: 32,
    gap: 32,
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
