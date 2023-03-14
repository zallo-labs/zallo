import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Box } from '~/components/layout/Box';
import { Button, Title } from 'react-native-paper';
import { AddrLink, parseAddrLink } from '~/util/addrLink';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { Overlay } from './Overlay';
import { isWalletConnectUri, useWalletConnect } from '~/util/walletconnect';

export type ScanScreenParams = {
  onScanAddr?: (link: AddrLink) => void;
};

export type ScanScreenProps = StackNavigatorScreenProps<'Scan'>;

export const ScanScreen = ({ route, navigation }: ScanScreenProps) => {
  const { onScanAddr } = route.params;
  const walletconnect = useWalletConnect();

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(false);
  const requestPermissions = useCallback(async () => {
    const { granted, canAskAgain } = await Camera.requestCameraPermissionsAsync();

    setHasPermission(granted);
    setCanAskAgain(canAskAgain);
  }, []);

  const [ratio, setRatio] = useState<string | undefined>('16:9');
  const detectRatio = useCallback(async () => {
    const ratios = await camera.current?.getSupportedRatiosAsync();
    if (ratios?.length) setRatio(ratios[ratios.length - 1]);
  }, [camera]);

  useEffect(() => {
    requestPermissions();
    detectRatio();
  }, [detectRatio, requestPermissions]);

  const [scanning, setScanning] = useState(false);
  const handleScanned = async (data: string) => {
    setScanning(true);

    const addrLink = parseAddrLink(data);
    if (addrLink) {
      onScanAddr?.(addrLink);
    } else if (isWalletConnectUri(data)) {
      await walletconnect.pair({ uri: data });
      navigation.goBack();
    } else {
      setScanning(false);
    }
  };

  if (!hasPermission) {
    if (hasPermission === null) {
      // User being prompted for permission
      return null;
    }

    return (
      <Box flex={1} vertical center m={3}>
        <Title style={{ textAlign: 'center' }}>
          Please grant camera permissions in order to scan a QR code
        </Title>
        {canAskAgain && <Button onPress={requestPermissions}>Grant</Button>}
      </Box>
    );
  }

  return (
    <Camera
      ref={camera}
      onBarCodeScanned={!scanning ? ({ data }) => handleScanned(data) : undefined}
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      style={StyleSheet.absoluteFill}
      ratio={ratio}
    >
      <Overlay handleScanned={handleScanned} />
    </Camera>
  );
};
