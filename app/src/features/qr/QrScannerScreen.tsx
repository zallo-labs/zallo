import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import useAsyncEffect from 'use-async-effect';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { parseAddrLink } from './addrLink';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Box } from '@components/Box';
import { Button, Title } from 'react-native-paper';
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
  const [canAskAgain, setCanAskAgain] = useState(false);
  const tryGrant = useCallback(async () => {
    const { granted, canAskAgain } =
      await Camera.requestCameraPermissionsAsync();
    setHasPermission(granted);
    setCanAskAgain(canAskAgain);
  }, []);

  useEffect(() => {
    tryGrant();
  }, [tryGrant]);

  const [scanned, setScanned] = useState(false);
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
      <Box flex={1} vertical center mx={2}>
        <Title style={{ textAlign: 'center' }}>
          Please grant camera permissions in order to scan a QR code
        </Title>
        {canAskAgain && <Button onPress={tryGrant}>Grant</Button>}
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
