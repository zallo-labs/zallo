import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Box } from '~/components/layout/Box';
import { Button, Title } from 'react-native-paper';
import { AddrLink, parseAddrLink } from '~/util/addrLink';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { Overlay } from './Overlay';
import {
  isWalletConnectPairingUri,
  usePairWalletConnect,
} from '~/util/walletconnect/usePairWalletConnect';

export type ScanScreenParams = {
  onScanAddr?: (link: AddrLink) => void;
};

export type ScanScreenProps = RootNavigatorScreenProps<'Scan'>;

export const ScanScreen = ({ route, navigation }: ScanScreenProps) => {
  const { onScanAddr } = route.params;
  const pairWc = usePairWalletConnect();

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(false);
  const requestPermissions = useCallback(async () => {
    const { granted, canAskAgain } =
      await Camera.requestCameraPermissionsAsync();

    setHasPermission(granted);
    setCanAskAgain(canAskAgain);
  }, []);

  const [ratio, setRatio] = useState<string | undefined>();
  const detectRatio = useCallback(async () => {
    const ratios = await camera.current?.getSupportedRatiosAsync();
    setRatio(ratios?.[0]);
  }, []);

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
    } else if (isWalletConnectPairingUri(data)) {
      await pairWc(data);
      navigation.goBack();
      // Navigates away on pair
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
      onBarCodeScanned={
        !scanning ? ({ data }) => handleScanned(data) : undefined
      }
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
