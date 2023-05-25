import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Appbar, Button, Text } from 'react-native-paper';
import { parseAddressLink } from '~/util/addressLink';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Overlay } from './Overlay';
import { isWalletConnectUri, useWalletConnect } from '~/util/walletconnect';
import { Screen } from '~/components/layout/Screen';
import { Actions } from '~/components/layout/Actions';
import { Address, tryAsAddress } from 'lib';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Splash } from '~/components/Splash';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import * as Linking from 'expo-linking';
import { EventEmitter } from '~/util/EventEmitter';
import useAsyncEffect from 'use-async-effect';
import { showError } from '~/provider/SnackbarProvider';
import { useFocusEffect } from '@react-navigation/native';
import { HideNavigationBar } from '~/components/NavigationBar/HideNavigationBar';

export const SCAN_ADDRESS_EMITTER = new EventEmitter<Address>('Scan::Address');
export const useScanAddress = SCAN_ADDRESS_EMITTER.createUseSelect('Scan');

export type ScanScreenParams = {};

export type ScanScreenProps = StackNavigatorScreenProps<'Scan'>;

export const ScanScreen = withSuspense(({ navigation: { goBack, navigate } }: ScanScreenProps) => {
  const walletconnect = useWalletConnect();

  const [scan, setScan] = useState(true);

  useFocusEffect(useCallback(() => setScan(true), [setScan]));

  const tryHandle = async (data: string) => {
    setScan(false);

    const address = tryAsAddress(data) || parseAddressLink(data)?.target_address;
    if (address) {
      const nListeners = SCAN_ADDRESS_EMITTER.emit(address);
      if (!nListeners) navigate('AddressSheet', { address });
      return true;
    } else if (isWalletConnectUri(data)) {
      try {
        await walletconnect.core.pairing.pair({ uri: data });
        goBack();
        return true;
      } catch {
        showError('Failed to connect. Please refresh the DApp and try again');
      }
    }

    setScan(true);
    return false;
  };

  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useAsyncEffect(
    async (isMounted) => {
      if (!permission?.granted) {
        await requestPermission();
        if (isMounted()) setPermissionsRequested(true);
      }
    },
    [requestPermission],
  );

  return permission?.granted || !permissionsRequested ? (
    <Camera
      onBarCodeScanned={scan ? ({ data }) => tryHandle(data) : undefined}
      barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
      style={StyleSheet.absoluteFill}
      ratio="16:9"
      useCamera2Api={false} // Causes crash on screen unmount - https://github.com/expo/expo/issues/18996
    >
      <HideNavigationBar />
      <Overlay onData={tryHandle} />
    </Camera>
  ) : (
    <Screen>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Permission required" />
      </Appbar.Header>

      <Text variant="headlineMedium" style={styles.pleaseGrantText}>
        Please grant camera permissions in order to scan a QR code
      </Text>

      <Actions>
        <Button
          mode="contained"
          onPress={async () => {
            await Linking.openSettings();
            requestPermission();
          }}
        >
          Open app settings
        </Button>
      </Actions>
    </Screen>
  );
}, Splash);

const styles = StyleSheet.create({
  pleaseGrantText: {
    textAlign: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
