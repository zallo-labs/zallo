import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import useAsyncEffect from 'use-async-effect';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { parseAddrLink } from './addrLink';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Box } from '@components/Box';
import { Title } from 'react-native-paper';
import { NavTarget, navToTarget } from '@features/navigation/target';

export type QrScannerParams = {
  target: NavTarget;
};

export type QrScannerScreenProps = RootNavigatorScreenProps<'QrScanner'>;

export const QrScannerScreen = ({
  navigation,
  route: {
    params: { target },
  },
}: QrScannerScreenProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  useAsyncEffect(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    try {
      const addrLink = parseAddrLink(data);
      setScanned(true);
      navToTarget(navigation, target, addrLink.target_address);
    } catch (e) {
      // The correct QR wasn't scanned, do nothing
    }
  };

  if (!hasPermission) {
    return (
      <Box vertical center>
        <Title>
          Please give permission to access the camera in order to scan a QR code
        </Title>
      </Box>
    );
  }

  return (
    <Camera
      onBarCodeScanned={!scanned ? handleBarCodeScanned : undefined}
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      style={StyleSheet.absoluteFillObject}
      ratio="16:9"
    />
  );
};
