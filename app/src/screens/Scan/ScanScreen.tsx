import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Button, Text } from 'react-native-paper';
import { parseAddressLink } from '~/util/addressLink';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Overlay } from './Overlay';
import { isWalletConnectUri, useWalletConnect } from '~/util/walletconnect';
import { Screen } from '~/components/layout/Screen';
import { Actions } from '~/components/layout/Actions';
import { Address, tryAsAddress } from 'lib';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Splash } from '~/components/Splash';

export type ScanScreenParams = {
  onAddress?: (address: Address) => void;
};

export type ScanScreenProps = StackNavigatorScreenProps<'Scan'>;

export const ScanScreen = withSuspense(
  ({ route, navigation: { goBack, replace } }: ScanScreenProps) => {
    const { onAddress } = route.params;
    const walletconnect = useWalletConnect();

    const [scan, setScan] = useState(true);
    const tryHandle = async (data: string) => {
      setScan(false);

      const address = tryAsAddress(data) || parseAddressLink(data)?.target_address;
      if (address) {
        if (onAddress) {
          onAddress(address);
        } else {
          replace('AddressSheet', { address });
        }
      } else if (isWalletConnectUri(data)) {
        await walletconnect.pair({ uri: data });
        goBack();
      } else {
        setScan(true);
      }
    };

    const [permission, requestPermission] = Camera.useCameraPermissions();

    useEffect(() => {
      requestPermission();
    }, [requestPermission]);

    if (!permission?.granted) {
      return (
        <Screen>
          <Text variant="headlineMedium" style={styles.pleaseGrantText}>
            Please grant camera permissions in order to scan a QR code
          </Text>

          <Actions>
            <Button
              mode="contained"
              onPress={requestPermission}
              style={styles.requestAction}
              disabled={permission !== null && !permission.canAskAgain}
            >
              Grant
            </Button>
          </Actions>
        </Screen>
      );
    }

    return (
      <Camera
        onBarCodeScanned={scan ? ({ data }) => tryHandle(data) : undefined}
        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
        style={StyleSheet.absoluteFill}
        ratio="16:9"
        useCamera2Api
      >
        <Overlay tryHandle={tryHandle} />
      </Camera>
    );
  },
  Splash,
);

const styles = StyleSheet.create({
  pleaseGrantText: {
    textAlign: 'center',
    marginHorizontal: 16,
    marginVertical: 32,
  },
  requestAction: {
    alignSelf: 'stretch',
  },
});
